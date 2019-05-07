import DatabaseService from './services/Database';

// TODO use knex migrations instead
async function main() {
  const service = new DatabaseService();
  await service.migrate();
  service.shutdown();
}

main().catch(console.error);
