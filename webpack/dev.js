const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const common = require('./common.js');

// must be the same as WEBPACK_DEVSERVER_HEADER
const DEVSERVER_HEADER = 'X-WEBPACK-DEVSERVER';

// points to STATIC_ROOT configured in django
const DST = path.resolve(__dirname, '../', 'build');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(DST, 'js'),
    filename: '[name].js',
    publicPath: 'http://localhost:4000/static/js/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    hot: true,
    inline: true,
    host: '0.0.0.0',
    port: 4000,
    compress: true,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      '/': {
        target: 'http://127.0.0.1:8081',
        onProxyReq: proxyReq => {
          // add header to let django know about getting a devserver request
          proxyReq.setHeader(DEVSERVER_HEADER, 'on');
        }
      },

    }
  }
});
