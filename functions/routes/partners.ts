import Router from 'koa-router';
import Parser from 'rss-parser';

const router = new Router();
const parser = new Parser();

router.get('/bsu', async (ctx, next) => {
  const feed = await parser.parseURL('https://brawlstarsup.com/feed/');
  if (feed.items === undefined) {
    ctx.body = {};
  } else {
    ctx.body = feed.items
      .map(({ title, link, contentSnippet }) => ({
        title,
        link,
        contentSnippet,
      }))
      .filter(({ title }) => !(title || '').includes('Tier List'));
    ctx.set('Cache-Control', 'public, max-age=3600');
  }
  await next();
});

export default router.routes();
