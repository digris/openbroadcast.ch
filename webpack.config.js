/* === dont forget to import scss to main.js file === */

require("babel-polyfill");

const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

const dev_mode = process.env.NODE_ENV !== 'production';

// points to STATIC_ROOT configured in django
const STATIC_ROOT = path.resolve(__dirname, 'app', 'static-src');

// pints to static source folder, un project root
const STATIC_SRC = path.resolve(__dirname, 'static');

// must be the same as WEBPACK_DEVSERVER_HEADER
const DEVSERVER_HEADER = 'X-WEBPACK-DEVSERVER';

module.exports = {
  //entry: './static/js/bundle.js',
  entry: ["babel-polyfill", "./static/js/bundle.js"],
  output: {
    path: dev_mode ? path.resolve(STATIC_ROOT, 'js') : path.resolve(STATIC_ROOT, 'dist', 'js'),
    filename: "bundle.js",
    publicPath: '/static/js/',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env'
            ]
          }
        }
      },
      {
          test: /\.vue$/,
          use: {
              loader: 'vue-loader',
              options: {
                  includePaths: ['./static/js/'],
              },
          }
      },
      {
          test: /\.scss$/,
          use: [
              'vue-style-loader',
              'css-loader',
              'sass-loader'
          ]
      },
      {
          test: /\.css$/,
          use: [
              'vue-style-loader',
              'css-loader'
          ]
      },
      {
        test: /\.sass$/,
        use: [
          dev_mode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              query: {
                includePaths: [
                  path.resolve(__dirname, 'node_modules')
                ]
              }
            },
          },
          {
            loader: 'postcss-loader',
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      // this is relative to output.path
      filename: '../css/bundle.css',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(STATIC_SRC, 'font'),
        to: path.resolve(STATIC_ROOT, 'font')
      },
      {
        from: path.resolve(STATIC_SRC, 'img'),
        to: path.resolve(STATIC_ROOT, 'img')
      },
    ], {debug: 'warning'}),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new VueLoaderPlugin(),
    // new HardSourceWebpackPlugin({
    //   configHash: function (webpackConfig) {
    //     return require('node-object-hash')({sort: false}).hash(webpackConfig);
    //   },
    //   cachePrune: {
    //     maxAge: 172800000,
    //     sizeThreshold: 52428800
    //   },
    // })
  ],
  resolve: {
      alias: {
          'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
      }
  },
  devServer: {
    hot: true,
    inline: true,
    host: '0.0.0.0',
    port: 4000,
    compress: true,
    overlay: true,
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
};
