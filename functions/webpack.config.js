const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  target: 'node',
  devtool: false,
  entry: {
    api: './functions/serverless.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'commonjs',
  },
  module: {
  },
  resolve: {
    extensions: [ '.js' ],
  },
};
