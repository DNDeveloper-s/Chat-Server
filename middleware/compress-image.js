const compress_images = require('compress-images');
const fs = require('fs');
module.exports = function compression(input, output, cb) {
    compress_images(input, output, {output: false, statistic: true, autoupdate: true}, false,
        {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
        {png: {engine: 'webp', command: false}},
        {svg: {engine: 'svgo', command: '--multipass'}},
        {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, 
        cb); 
}