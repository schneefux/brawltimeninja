const path = require('path')

const serverConfig = {
  mode: process.env.NODE_ENV,
  target: 'node',
  devtool: false,
  entry: {
    media: './server.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/'),
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
    sharp: 'commonjs sharp',
  },
}

module.exports = [serverConfig]
