import Router from 'koa-router';
import sharp from 'sharp';
import fileType from 'file-type';

import MediaService from './services/Media';
import { Context } from 'koa';

const service = new MediaService();

const router = new Router();

router.get('/status', async (ctx, next) => {
  ctx.body = ({ 'status': 'ok' });
  await next();
});

async function respond(ctx: Context, buffer: Buffer|null) {
  // reply with placeholder image for 404
  let img = buffer != null ? sharp(buffer) : sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: { r: 0, b: 0, g: 0, alpha: 0.0 },
    }
  }).png();

  if ('size' in ctx.query) {
    img = img.resize(parseInt(ctx.query.size));
  }
  img = img.toFormat(ctx.accepts('webp') ? 'webp' : ('noalpha' in ctx.query ? 'jpg' : 'png'))
  ctx.body = await img.toBuffer();

  const type = await fileType.fromBuffer(ctx.body);
  if (type !== undefined) {
    ctx.type = type.mime;
  }
  if (buffer != null) {
    ctx.set('Cache-Control', 'public, max-age=86400'); // 1 day
  }
}

router.get('/brawlers/:name/avatar', async (ctx, next) => {
  const buffer = await service.getBrawlerAvatar(ctx.params.name, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get('/brawlers/:name/model', async (ctx, next) => {
  const buffer = await service.getBrawlerModel(ctx.params.name, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get('/starpowers/:id', async (ctx, next) => {
  const buffer = await service.getStarpower(ctx.params.id, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

router.get('/maps/:id', async (ctx, next) => {
  let id = ctx.params.id;
  if (id.length < '15000000'.length) {
    id = id.replace('^150', '1500');
  }

  const buffer = await service.getMap(id, ctx.req.headers.accept || '');
  await respond(ctx, buffer);
  await next();
});

export default router.routes();
