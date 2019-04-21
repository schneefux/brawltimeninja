import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

import glob from 'tiny-glob';
import Router from 'koa-router';
import marked from 'marked';

import AppService from '../services/AppService';
import Blog, { Post } from '../model/Blog';
import { Service } from '../services/AppServiceFactory';

const GENERATE_BLOG = !!process.env.GENERATE_BLOG;

const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);

/**
 * Add support for resizing and styling via ![alt](src.png=class1,class2)
 */
const renderer = new marked.Renderer();
renderer.image = (src, title, alt) => {
  let classes;
  if (src.includes('=')) {
    classes = src.substring(src.lastIndexOf('=') + 1).split(',');
    src = src.substring(0, src.lastIndexOf('='));
  }

  let res = `<img src="${src}" alt="${alt}"`;

  if (classes != undefined) {
    res += ` class="${classes.join(' ')}"`;
  }

  return res + '>';
};
marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
  tables: true,
  smartLists: true,
  smartypants: true,
});

/**
 * Expand macros
 */
function expandMacros(markdown: string, app: string) {
  // expand ![~folder/path/icon.png]
  markdown = markdown.replace(/!\[~([\w\/.-]+)\]/g, `![$1](/images/${app}/$1)`);
  // expand ![~folder/path/icon.png class1,class2]
  markdown = markdown.replace(/!\[~([\w\/.-]+) (([\w:-]+)(,[\w:-]+)*)\]/g, `![$1](/images/${app}/$1=$2)`);

  return markdown;
}

/**
 * Read and render blog posts
 */
export async function renderBlog(name: string): Promise<Blog> {
  if (!Object.keys(Service).includes(name)) {
    return {};
  }

  const guideFiles = await glob(`blog/${name}/guides/*.md`).catch(() => <string[]>[]);

  const guides = await Promise.all(guideFiles.map(async (file) => {
    const content = (await readFileP(file)).toString();
    const split = content.indexOf('\n');
    const meta = JSON.parse(content.substring(0, split));
    const text = content.substring(split + 1);
    return {
      ...meta,
      content: marked(expandMacros(text, name)),
    } as Post;
  }));

  const blog = { guides };

  await writeFileP(`blog/${name}/blog.json`, JSON.stringify(blog, null, 2));
  return blog;
}

/**
 * Get blog from cache or render
 */
async function getBlog(name: string): Promise<Blog> {
  let blog;

  if (!GENERATE_BLOG) {
    try {
      blog = (await import(`../blog/${name}/blog.json`)).default;
    } catch (err) {
      console.log('blog cache is empty!');
    }
  }

  if (blog == undefined) {
    // not available in serverless setup because files don't exist
    blog = await renderBlog(name);
  }

  return blog;
}

export default function createRoutes(service: AppService, name: string) {
  const router = new Router();

  router.get('/shards', async (ctx, next) => {
    ctx.body = service.getShards();
    ctx.set('Cache-Control', 'public, max-age=3600');
    await next();
  });

  router.get('/labels', async (ctx, next) => {
    ctx.body = service.getLabels();
    ctx.set('Cache-Control', 'public, max-age=3600');
    await next();
  });

  router.get('/featured-players', async (ctx, next) => {
    ctx.body = service.getFeaturedPlayers();
    ctx.set('Cache-Control', 'public, max-age=3600');
    await next();
  });

  router.get('/blog', async (ctx, next) => {
    ctx.body = await getBlog(name);
    ctx.set('Cache-Control', 'public, max-age=3600');
    await next();
  });

  router.get('/player/:shard/:name', async (ctx, next) => {
    const data = await service.getPlayerStatistics(ctx.params.shard, ctx.params.name);
    if (data == null) {
      ctx.throw(404, 'not found');
    } else {
      ctx.body = data;
    }
    ctx.set('Cache-Control', 'public, max-age=300');
    await next();
  });

  return router.routes();
};
