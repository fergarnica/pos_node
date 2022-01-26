const path = require('path');
const webpack = require('webpack');
require("babel-polyfill");

module.exports = {
    entry: ['babel-polyfill','./public/js/app.js'],
    output : {
        filename : 'bundle.js',
        path: path.join(__dirname, './public/dist')
    }, 
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use : {
                    loader: 'babel-loader',
                    /* query: {compact: false}, */
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ["transform-regenerator"]
                    }
                }
            }
        ]
    }
}