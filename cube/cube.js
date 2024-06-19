const ClickhouseDriver = require('@cubejs-backend/clickhouse-driver')

module.exports = {
  dbType: 'clickhouse',
  driverFactory: () => new ClickhouseDriver({
    readOnly: true,
    database: 'brawltime',
    queryOptions: {
      readonly: 1,
      join_use_nulls: 1,
      max_threads: 1,
      output_format_json_quote_64bit_integers: 1,
      allow_experimental_window_functions: 1,
      // maximum estimated execution time, in seconds
      max_execution_time: 300,
    },
  }),
  apiSecret: process.env.CUBEJS_API_SECRET || 'secret',
  telemetry: false,
  checkAuth: (req, auth) => ({ securityContext: {} }),
  // TODO: set up datadog monitoring
  http: {
    cors: {
      origin: '*',
      allowedHeaders: 'authorization,content-type,x-request-id,cache-control',
      maxAge: 86400, // 24h max, capped by Firefox
    },
  },
};
