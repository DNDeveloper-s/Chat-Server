const path = require('path');

module.exports = {
    mode: 'development',
    entry: './public/assets/js/main.js',
    output: {
      path: path.resolve(__dirname, 'public/assets/js'),
      filename: 'main.bundle.js'
    }
  };