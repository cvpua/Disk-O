const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  // the output bundle won't be optimized for production but suitable for development
  mode: 'development',
  // the app entry point is /src/index.js
  entry: "./src/index.tsx",
  devtool:'inline-source-map',
  output: {
  	// the output of the webpack build will be in /dist directory
    path: path.resolve(__dirname, 'dist'),
    // the filename of the JS bundle will be bundle.js
    filename: 'bundle.[fullhash].js'
  },
  // add a custom index.html as the template
  plugins: [
    new HtmlWebpackPlugin({ template: path.resolve(__dirname,'src', 'index.html') })
  ],
  resolve:{
    modules: [__dirname, "src", "node_modules"],
    extensions: ["*",".tsx",".ts",".js",".jsx"],
  },
  module: {
    rules: [
      {
      	// for any file with a suffix of js or jsx
        test: /\.tsx?$/,
        // ignore transpiling JavaScript from node_modules as it should be that state
        exclude: /node_modules/,
        // use the babel-loader for transpiling JavaScript to a suitable format
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.png|svg|jpg|gif$/,
        use: ["file-loader"],
      },     
    ]
  },
  devServer:{
    allowedHosts: ['.yses.org'],
    proxy:{
      '/api': 'http://disko-server:8085'
    }
  }
};