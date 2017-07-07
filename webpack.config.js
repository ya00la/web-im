var webpack = require('webpack');
path = require('path');

module.exports = {
    entry: {
        './project/dist/im-1.4.11': ['./project/src/entry']
    },
    output: {
        path: './',
        publicPath: './',
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
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader'
            },
            {
                test: /\.svg|woff|eot|ttf$/,
                loader: require.resolve('file-loader') + '?name=[path][name].[ext]'
            }
        ]
    },
    plugins: [
        // new webpack.NoErrorsPlugin(),
        // production must be with `UglifyJsPlugin` or ie9 crash
        // faster your app better use
        // https://github.com/facebook/react/issues/7803
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
        // new webpack.optimize.UglifyJsPlugin({
        //     compressor: {
        //         drop_debugger: process.env.NODE_ENV === 'production',
        //         drop_console: process.env.NODE_ENV === 'production',
        //         warnings: false
        //     }
        // })
    ],
}
;

