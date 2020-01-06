import TrackerService from './services/Tracker';

async function main() {
  const service = new TrackerService();
  await service.materialize();
  service.shutdown();
}

main().catch(e => {
  console.error(e);
  process.exit();
});
