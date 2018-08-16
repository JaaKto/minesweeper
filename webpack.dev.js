const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devServer: { // configuration for webpack-dev-server
    contentBase: './src/public', // source of static assets
    port: 7700, // port to run dev-server
  },
  module: { // where we defined file patterns and their loaders
    rules: [
      {
        test: /\.(sass|scss)$/,
        use: [{
          loader: 'style-loader', // creates style nodes from JS strings
        }, {
          loader: 'css-loader', // translates CSS into CommonJS
        }, {
          loader: 'sass-loader', // compiles Sass to CSS
        }],
      },
    ],
  },
});
