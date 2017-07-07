var webpack = require('webpack');
path = require('path');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');

console.log('=========当前运行环境:' + process.env.NODE_ENV + '=========')

console.log(path.resolve('./'));
module.exports = {
    entry: {
        // "only" prevents reload on syntax errors
        './project/dist/im-1.4.11': ['./project/src/entry']
    },
    externals: {
        WebIM: 'window.WebIM'
    },
    output: {
        path: path.resolve('./'),
        publicPath: '/',
        filename: '[name].js'
    },
    // devtool: '#eval-cheap-module-source-map',
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel',
                exclude: /(node_modules|bower_components|dist)/
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass'
            },
            {
                test: /\.svg|woff|eot|ttf$/,
                loader: require.resolve('file-loader') + '?name=[path][name].[ext]'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new OpenBrowserPlugin({url: 'http://localhost:3000'}),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
        // new webpack.optimize.UglifyJsPlugin({
        //     compressor: {
        //         // drop_debugger: process.env.NODE_ENV === 'production',
        //         // drop_console: process.env.NODE_ENV === 'production',
        //         warnings: false
        //     }
        // })
    ],
}
;

