const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const postcssImport = require('postcss-import');
const postcssSimpleVars = require('postcss-simple-vars');
const cssnext = require('postcss-cssnext');

const Config = {
  name: 'serialist',
  devtool: 'sourcemap',
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'src/js/index.js')
  ],
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'serialist.js'
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
        include: path.resolve(__dirname, 'src/js/'),
        exclude: /(node_modules|bower_components|workers)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0', 'react'],
          plugins: ['transform-runtime', 'transform-decorators-legacy']
        }
      },
      // Process .css files:
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src/css/'),
        exclude: /(node_modules|bower_components)/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          [
            'css-loader?importLoaders=1',
            'postcss-loader?sourceMap=inline'
          ]
        )
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
    }),
    // Extract css
    new ExtractTextPlugin('serialist.css', {
      allChunks: true
    })
  ],
  postcss: function(webpack) {
    return [
      postcssImport({
        addDependencyTo: webpack,
        root: 'src/css'
      }),
      postcssSimpleVars(),
      cssnext()
    ];
  }
};

module.exports = Config;