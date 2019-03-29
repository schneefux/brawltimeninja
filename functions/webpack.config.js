const path = require('path')

module.exports = {
  mode: process.env.NODE_ENV,
  target: 'node',
  devtool: false,
  entry: {
    api: './serverless.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [ {
      test: /\.ts$/,
      use: [ { loader: 'ts-loader' } ],
      exclude: /node_modules/
    } ],
  },
  resolve: {
    extensions: [ '.ts', '.js', '.json' ],
  },
}
