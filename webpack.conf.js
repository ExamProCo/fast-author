const path = require('path')
const webpack = require('webpack')

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


module.exports = [
  namespace_application
]

