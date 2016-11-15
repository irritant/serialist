const path = require('path');
const webpack = require('webpack');
const combineLoaders = require('webpack-combine-loaders');

const jsLoader = combineLoaders([
  {
    loader: 'babel-loader',
    query: {
      presets: ['es2015', 'stage-0'],
      plugins: ['transform-runtime', 'transform-decorators-legacy']
    }
  },
  {
    loader: 'eslint-loader'
  }
]);

const Config = {
  name: 'client',
  devtool: 'sourcemap',
  publicPath: 'dist/',
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'src/js/workers/serialist-player-worker.js')
  ],
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/',
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
        test: /\.js?$/,
        include: path.resolve(__dirname, 'src/js/workers/'),
        exclude: /(node_modules|bower_components)/,
        loader: jsLoader
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin()
  ]
};

module.exports = Config;