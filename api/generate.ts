import { writeFile } from 'fs';
import { promisify } from 'util';

import { renderBlog } from './routes/blog';
import BrawlstarsService from './services/Brawlstars';

const writeFileP = promisify(writeFile);

async function main() {
  const blog = await renderBlog();
  const featuredPlayers = await new BrawlstarsService().getFeaturedPlayers();
  const mapMeta = await new BrawlstarsService().getMapMeta({});
  const events = [...Object.entries(mapMeta)].map(([id, map]: any) => ({
    id,
    mode: map.mode,
    map: map.map,
  }))
  const payload = { blog, featuredPlayers, events };

  await writeFileP('./payload.json', JSON.stringify(payload, null, 2));
}

main().catch(console.error);
