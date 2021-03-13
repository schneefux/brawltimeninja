import config from '../dist/lib/cube.js'

// cube.js imports are not 'real' imports
// -> access `.default`
Object.values(config.default).forEach((c) => {
  cube(c.id, {
    refreshKey: {
      every: '10 minutes',
    },
    sql: `SELECT * FROM brawltime.${c.table}`,
    rewriteQueries: true,

    measures: c.measurements.reduce((ms, m) => ({
      ...ms,
      [m.id + '_measure']: {
        title: m.name,
        ...(m.description != '' ? {
          description: m.description,
        } : {}),
        sql: m.config.sql,
        type: m.config.type,
        meta: {
          formatter: m.formatter,
          d3formatter: m.d3formatter,
          sign: m.sign,
          percentage: m.percentage,
          vega: {
            type: m.type,
            scale: m.scale,
          },
        },
      },
    }), {}),

    dimensions: c.dimensions.reduce((ds, d) => ({
      ...ds,
      [d.id + '_dimension']: {
        title: d.name,
        sql: d.config.sql,
        type: d.config.type,
        shown: !d.hidden,
        meta: {
          formatter: d.formatter,
          vega: {
            type: d.type,
            scale: d.scale,
          },
        },
      },
    }), {}),
  })
})
