const path = require('path')

const serverConfig = {
  mode: process.env.NODE_ENV,
  target: 'node',
  devtool: false,
  entry: {
    api: './apps/api.ts',
    tracker: './apps/tracker.ts',
    migrate: './migrate.ts',
    materialize: './materialize.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/apps'),
  },
  module: {
    rules: [ {
      test: /\.ts$/,
      use: [
        { loader: 'ts-loader' }
      ],
      exclude: /node_modules/
    } ],
  },
  resolve: {
    extensions: [ '.ts', '.js', '.json' ],
  },
  externals: {
    knex: 'commonjs knex',
  },
}

module.exports = [serverConfig]
