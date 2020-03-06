const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './public/assets/js/main.js',
    dashBoard: './public/assets/js/dashBoard.js',
  },
  output: {
    path: path.resolve(__dirname, 'public/assets/js'),
    filename: '[name].bundle.js'
  },
  // entry: './public/assets/js/dashBoard.js',
  // output: {
  //   path: path.resolve(__dirname, 'public/assets/js'),
  //   filename: 'dashBoard.bundle.js'
  // }
};