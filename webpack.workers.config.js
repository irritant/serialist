const path = require('path');
const webpack = require('webpack');

const Config = {
  name: 'serialist',
  devtool: 'sourcemap',
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'src/js/workers/serialist-player-worker.js')
  ],
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'serialist-player-worker.js'
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules']
  },
  module: {
    loaders: [
      // Process .js and .jsx files:
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/js/workers/'),
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0'],
          plugins: ['transform-runtime', 'transform-decorators-legacy']
        }
      }
    ]
  },
  plugins: [
    // Minify js
    new webpack.optimize.UglifyJsPlugin({
      compress: {
          warnings: false
      },
      sourceMap: true
    })
  ]
};

module.exports = Config;