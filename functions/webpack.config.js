const path = require('path')

const lambdaConfig = {
  mode: process.env.NODE_ENV,
  target: 'node',
  devtool: false,
  entry: {
    api: './apps/api.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [ {
      test: /\.ts$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                { targets: { node: '8.15.0' } },
              ],
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-object-assign',
              '@babel/plugin-proposal-object-rest-spread',
            ]
          }
        },
        { loader: 'ts-loader' }
      ],
      exclude: /node_modules/
    } ],
  },
  resolve: {
    extensions: [ '.ts', '.js', '.json' ],
  },
}

const serverConfig = {
  mode: process.env.NODE_ENV,
  target: 'node',
  devtool: false,
  entry: {
    api: './apps/api.ts',
    tracker: './apps/tracker.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
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

module.exports = [lambdaConfig, serverConfig]
