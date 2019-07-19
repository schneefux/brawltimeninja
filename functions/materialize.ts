import TrackerService from './services/Tracker';

async function main() {
  const service = new TrackerService();
  await service.materialize();
  service.shutdown();
}

main().catch(console.error);
