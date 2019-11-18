const merge = require('webpack-merge');
const path = require('path');
const common = require('./common.js');

// points to STATIC_ROOT configured in django
// const STATIC_ROOT = path.resolve(__dirname, 'app', 'static-src');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../', 'build', 'js'),
    filename: '[name].js',
  },
});
