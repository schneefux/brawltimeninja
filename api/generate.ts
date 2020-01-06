import { writeFile } from 'fs';
import { promisify } from 'util';

import { renderBlog } from './routes/blog';
import BrawlstarsService from './services/Brawlstars';

const writeFileP = promisify(writeFile);

async function main() {
  const blog = await renderBlog();
  const featuredPlayers = await new BrawlstarsService().getFeaturedPlayers();
  const payload = { blog, featuredPlayers };

  await writeFileP('./payload.json', JSON.stringify(payload, null, 2));
}

main().catch(console.error);
