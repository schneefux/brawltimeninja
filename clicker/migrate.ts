import ClickerService from './services/Clicker'

async function main() {
  const service = new ClickerService()
  await service.migrate()
}

main().catch(console.error)
