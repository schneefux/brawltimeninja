import { readFile } from 'fs';
import { promisify } from 'util';

import glob from 'tiny-glob';
import Router from 'koa-router';
import marked from 'marked';

import AppService from '../services/AppService';
import Blog, { Post } from '../model/Blog';
import { Service } from '../services/AppServiceFactory';

const readFileP = promisify(readFile);

async function getBlog(name: string): Promise<Blog> {
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
      content: marked(text),
    } as Post;
  }));

  return {
    guides,
  };
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
