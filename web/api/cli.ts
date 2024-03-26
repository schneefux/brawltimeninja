import 'dotenv/config'
import { Command } from 'commander'
import { updateAllProfiles } from './routes/player'
import { updateAllReports, updateReport } from './routes/report'

const program = new Command()

program
  .command('update-profiles')
  .description('Update tracked profiles')
  .action(async () => {
    console.time('profiles update')
    const summary = await updateAllProfiles()
    console.timeEnd('profiles update')
    console.log(summary)
    process.exit(0)
  })

program
  .command('update-reports')
  .description('Update AI reports')
  .action(async () => {
    console.time('reports update')
    const summary = await updateAllReports()
    console.timeEnd('reports update');
    console.log(summary)
    process.exit(0)
  })

program
  .command('update-report')
  .description('Update a report')
  .option('-l, --locale <locale>', 'Locale')
  .option('-m, --mode <mode>', 'Mode')
  .option('-p, --map <map>', 'Map')
  .action(async (options) => {
    console.time('report update')
    const { locale, mode, map } = options
    const summary = await updateReport(locale, mode, map)
    console.timeEnd('report update')
    console.log(summary)
    process.exit(0)
  })

program.parse(process.argv)
