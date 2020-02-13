const ExtractTextPlugin = require("extract-text-webpack-plugin")
const path = require('path')
const webpack = require('webpack')
const fs = require('fs')

const scss = {
  test: /\.sass$/,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [
      { loader: "css-loader", options: {url: false} },
      {
        loader: 'sass-loader',
        options: { indentedSyntax: true }
      }
    ]
  })
}
const css = {
  test: /\.css$/,
  use: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: [{ loader: "css-loader", options: {url: false} }]
  })
}

const coffee = {
  test: /\.coffee$/, loader: 'coffee-loader'
}

const namespace_application = {
  mode: 'production',
  target: 'electron-renderer',
  devtool: 'none',
  entry: {
    'renderer.js' : path.resolve(__dirname, 'src/application.coffee')
  },
  output: {
    path    : path.resolve(__dirname),
    filename: '[name]'
  },
  resolve: {
    extensions: ['.coffee','.js','.json'],
    modules: ['node_modules/'],
    alias: {
      components : path.resolve(__dirname, 'src/components/'),
      common     : path.resolve(__dirname, 'src/common/'),
      views      : path.resolve(__dirname, 'src/views/'),
      lib        : path.resolve(__dirname, 'src/lib/'),
    }
  },
  node: { __dirname: false },
  module : { rules: [coffee] }
}

const namespace_styles = {
  target: 'web',
  entry: {
    'style.css' : path.resolve(__dirname, 'sass/style.sass')
  },
  output: {
    path    : path.resolve(__dirname),
    filename: '[name]'
  },
  node: { __dirname: false },
  module : { rules: [scss,css] },
  plugins: [ 
    new ExtractTextPlugin("style.css"),
  ]
}


module.exports = [
  namespace_application,
  namespace_styles
]

