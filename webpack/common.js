require("babel-polyfill");

const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

const DEV_MODE = process.env.NODE_ENV !== 'production';

// pints to source to be built by webpack
const SRC = path.resolve(__dirname, '../', 'src');

// points to STATIC_ROOT configured in django
const BUILD = path.resolve(__dirname, '../', 'build');

module.exports = {
  entry: {
    'bundle': ["@babel/polyfill", "./src/js/bundle.js"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader'
        }
      },
      {
          test: /\.vue$/,
          use: {
              loader: 'vue-loader',
              options: {
                  includePaths: ['./src/js/'],
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
          DEV_MODE ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
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
    // new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      // this is relative to output.path
      filename: '../css/bundle.css',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(SRC, 'font'),
        to: path.resolve(BUILD, 'font')
      },
      {
        from: path.resolve(SRC, 'img'),
        to: path.resolve(BUILD, 'img')
      },
      {
        from: path.resolve(SRC, 'icons'),
        to: path.resolve(BUILD, 'icons')
      },
    ], {debug: 'warning'}),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new VueLoaderPlugin(),
  ],
  resolve: {
      alias: {
          'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
      }
  },

};
