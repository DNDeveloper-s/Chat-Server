const path = require('path');
module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.js',
    dashboard: './src/dashboard.js',
  },
  output: {
    path: path.resolve(__dirname, 'public/assets/js'),
    filename: '[name].bundle.js'
  },
  // externals: /^(jquery|\$)$/i
  // entry: './public/assets/js/dashBoard.js',
  // output: {
  //   path: path.resolve(__dirname, 'public/assets/js'),
  //   filename: 'dashBoard.bundle.js'
  // }
};