import Router from 'koa-router';
import Parser from 'rss-parser';
import { cache } from '../lib/request'

const router = new Router();
const parser = new Parser();

router.get('/bsu', async (ctx, next) => {
  const feed = <Parser.Output> await cache.wrap(
    'request:https://brawlstarsup.com/feed/',
    () => parser.parseURL('https://brawlstarsup.com/feed/'),
    { ttl: 60*60 },
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
