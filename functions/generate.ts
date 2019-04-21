import { renderBlog } from './routes/AppRoutesFactory';

const APP = process.env['NINJA_APP'] || 'brawlstars';

async function main() {
  await renderBlog(APP);
}

main().catch(console.error);
