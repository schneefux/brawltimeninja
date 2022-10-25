import { ServerMiddleware } from '@nuxt/types'
import express from 'express'

import config from '../lib/klicker.conf'

const app = express()

app.get('/schema', (req, res, next) => {
  const schema: string[] = []
  Object.values(config).forEach((c) => schema.push(
`
/* generated on ${new Date().toISOString()} */

cube('${c.id}', {
refreshKey: {
  every: '10 minutes',
},
sql: \`SELECT * FROM brawltime.${c.table}\`,
rewriteQueries: true,

measures: {
${c.metrics.map((m) => `
  ${m.id}_measure: {
    title: '${m.name}',
    ${m.description != undefined ? 'description: \'' + m.description + '\',' : '' }
    sql: ${JSON.stringify(m.config.sql)},
    type: '${m.config.type}',
  }`).join(',\n')}
},

dimensions: {
${c.dimensions.map((d) => `
  ${d.id}_dimension: {
    title: '${d.name}',
    sql: ${JSON.stringify(d.config.sql)},
    type: '${d.config.type}',
  }`).join(',\n')}
}
})`
  ))

  res.set('content-type', 'text/plain')
  res.send(schema.join('\n'))
})

const klickerMiddleware: ServerMiddleware = app
export default klickerMiddleware
