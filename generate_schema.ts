import config from './web/lib/klicker.conf'

Object.values(config).forEach((c) => console.log(
`
cube(${c.id}, {
refreshKey: {
  every: '10 minutes',
},
sql: \`SELECT * FROM brawltime.${c.table}\`,
rewriteQueries: true,

measures: ${JSON.stringify(c.measurements.reduce((ms, m) => ({
  ...ms,
  [m.id + '_measure']: {
    title: m.name,
    ...(m.description != '' ? {
      description: m.description,
    } : {}),
    sql: m.config.sql,
    type: m.config.type,
  },
}), {}), null, 2)}

dimensions: ${JSON.stringify(c.dimensions.reduce((ds, d) => ({
  ...ds,
  [d.id + '_dimension']: {
    title: d.name,
    sql: d.config.sql,
    type: d.config.type,
    shown: !d.hidden,
  },
}), {}), null, 2)}
})
`
))
