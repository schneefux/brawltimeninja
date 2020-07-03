import TrackerService from './services/Tracker';

async function main() {
  const service = new TrackerService();
  await service.cleanup();
  service.shutdown();
}

main().catch(e => {
  console.error(e);
  process.exit();
});
