import { renderBlog } from './routes/blog';

async function main() {
  await renderBlog();
}

main().catch(console.error);
