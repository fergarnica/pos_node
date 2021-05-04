const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './public/js/app.js',
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
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}