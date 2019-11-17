import Router from 'koa-router';
import Parser from 'rss-parser';
import cacheManager from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';

const router = new Router();
const parser = new Parser();

const cachePath = process.env.CACHE_PATH || 'cache';
const cacheDisable = !!process.env.CACHE_DISABLE;

const cache = cacheDisable ?
  cacheManager.caching({
    store: 'memory',
    max: 0,
    ttl: 180,
  }) :
  cacheManager.caching(<any>{
    store: fsStore,
    max: 10000,
    ttl: 180,
    options: { path: cachePath, subdirs: true, },
  });

router.get('/bsu', async (ctx, next) => {
  const feed = <Parser.Output> await cache.wrap(
    'https://brawlstarsup.com/feed/',
    () => parser.parseURL('https://brawlstarsup.com/feed/')
  );
  if (feed.items === undefined) {
    ctx.body = {};
  } else {
    ctx.body = feed.items
      .map(({ title, link, contentSnippet }) => ({
        title,
        link,
        contentSnippet: (contentSnippet || '').split('. ').slice(0, 1).join('. '),
      }))
      .filter(({ title }) => !(title || '').includes('Tier List'))
      .slice(0, 2);
    ctx.set('Cache-Control', 'public, max-age=3600');
  }
  await next();
});

export default router.routes();
