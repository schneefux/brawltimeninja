import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

import glob from 'tiny-glob';
import Router from 'koa-router';
import marked from 'marked';

import Blog, { Post } from '../model/Blog';

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
function expandMacros(markdown: string) {
  // expand ![~folder/path/icon.png]
  markdown = markdown.replace(/!\[~([\w\/.-]+)\]/g, `![$1](/images/$1)`);
  // expand ![~folder/path/icon.png class1,class2]
  markdown = markdown.replace(/!\[~([\w\/.-]+) (([\w:-]+)(,[\w:-]+)*)\]/g, `![$1](/images/$1=$2)`);

  return markdown;
}

/**
 * Read and render blog posts
 */
export async function renderBlog(): Promise<Blog> {
  const guideFiles = await glob(`blog/guides/*.md`).catch(() => <string[]>[]);

  const guides = await Promise.all(guideFiles.map(async (file) => {
    const content = (await readFileP(file)).toString();
    const split = content.indexOf('\n');
    const meta = JSON.parse(content.substring(0, split));
    const text = content.substring(split + 1);
    return {
      ...meta,
      content: marked(expandMacros(text)),
    } as Post;
  }));

  const blog = { guides };

  await writeFileP(`blog/blog.json`, JSON.stringify(blog, null, 2));
  return blog;
}

/**
 * Get blog from cache or render
 */
async function getBlog(): Promise<Blog> {
  let blog;

  if (!GENERATE_BLOG) {
    try {
      blog = (await import(`../blog/blog.json`)).default;
    } catch (err) {
      console.log('blog cache is empty!');
    }
  }

  if (blog == undefined) {
    // not available in serverless setup because files don't exist
    blog = await renderBlog();
  }

  return blog;
}

const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.body = await getBlog();
  ctx.set('Cache-Control', 'public, max-age=3600');
  await next();
});

export default router.routes();
