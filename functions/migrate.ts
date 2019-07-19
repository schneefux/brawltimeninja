import TrackerService from './services/Tracker';

// TODO use knex migrations instead
async function main() {
  const service = new TrackerService();
  await service.migrate();
  service.shutdown();
}

main().catch(console.error);
