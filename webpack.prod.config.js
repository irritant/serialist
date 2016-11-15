const path = require('path');
const webpack = require('webpack');
const combineLoaders = require('webpack-combine-loaders');
const htmlWebpackPlugin = require('html-webpack-plugin');

const jsLoader = combineLoaders([
  {
    loader: 'babel-loader',
    query: {
      presets: ['es2015', 'stage-0', 'react'],
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
    path.resolve(__dirname, 'src/js/index.js')
  ],
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/dist/',
    filename: 'index.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules']
  },
  module: {
    loaders: [
      // Process .js and .jsx files:
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, 'src/'),
        exclude: /(node_modules|bower_components|workers)/,
        loader: jsLoader
      }
    ]
  },
  plugins: [
    new htmlWebpackPlugin({
      template: 'src/views/index.html',
      filename: './views/index.html',
      inject: 'head',
      hash: true
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    // Minify js
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        sourceMap: true
    }),
    // Flag for production:
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
};

module.exports = Config;