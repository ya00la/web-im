var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev');
var proxyMiddleware = require('http-proxy-middleware')

var app = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    // contentBase: ['./demo', './sdk'],
    hot: true,
    inline: false,
    progress: true,
    compress: true,
    historyApiFallback: true,
    stats: {
        chunks: false,
        children: false,
        colors: true
    },
    watchOptions: {
        aggregateTimeout: 300,
        poll: true,
    }
    // headers: { 'Access-Control-Allow-Origin': '*' }
})

var API_ROOT = 'http://112.124.50.44:8080/crowdfundingservice2/'
if (process.env.NODE_ENV === 'production') {
    //正式环境
    API_ROOT = 'http://120.55.197.143:8080/crowdfundingservice2/'
} else if (process.env.NODE_ENV === 'test') {
    // 测试环境
    API_ROOT = 'http://112.124.50.44:8080/crowdfundingservice2/'
} else if (process.env.NODE_ENV === 'dev') {
    // 开发环境
    API_ROOT = 'http://121.40.57.102:8080/crowdfundingservice2/'
}

var context = '/api';//context 可以使一个数组['/object/api','/object2/api',...] 
var options = {
    target: API_ROOT,//目标服务器地址
    changeOrigin: true,             //虚拟主机网站需要
    pathRewrite: {
      '^/api': ''
    }
  }
app.use(proxyMiddleware(context, options))
// app.listen(3000)
// var hostname = '192.168.20.187'
var hostname = 'localhost'
app.listen(3000, hostname, function (err, result) {
    // console.log(result)
    if (err) {
        return console.log(err);
    }

    console.log('Listening at http://localhost:3000/');
})
