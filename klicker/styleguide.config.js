const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  components: './components/**/*.vue',
  webpackConfig: {
     resolve: {
        extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx', '.json'],
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
      }, {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ],
      }, {
        test: /\.postcss$/, // for lang="postcss"
        use: [
          'vue-style-loader', {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          }, {
            loader: 'postcss-loader',
            options: {
              implementation: require('postcss'),
            },
          },
        ],
      }, {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      }]
    },
    plugins: [
      new VueLoaderPlugin(),
    ],
  },
}
