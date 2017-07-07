import { Buffer } from 'buffer'
import md5 from 'md5'
import reqwest from 'reqwest'
import { setStorage, getStorage, removeStorage } from './authService'

var API_ROOT = 'http://112.124.50.44:8080/crowdfundingservice2/' //测试环境
console.log('config-env', process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production') {
  API_ROOT = 'http://120.55.197.143:8080/crowdfundingservice2/'
} else if (process.env.NODE_ENV === 'test') {
  API_ROOT = 'http://112.124.50.44:8080/crowdfundingservice2/'
} else if (process.env.NODE_ENV === 'dev') {
  API_ROOT = 'http://121.40.57.102:8080/crowdfundingservice2/'
}
var defaultConfig = {
    cookieDomain: 'www.kaistart.com',
    API_ROOT: API_ROOT
}

function fetch (url,method,param,callBack, tag) {
  let paramsStr = ''
  let baseUrl = []
  let union = '&' // url与参数的连接符。
  let params = param
    if (url.indexOf('?') !== -1) { // 如果api接口请求url里面已经带了？参数
       url = url + '&client=web'
       baseUrl = url.split('?')
    } else{
      url = url + '?client=web'
      baseUrl = [url , '']
    }

  var contentLength = -1
  if (method !== 'GET') {
    params = JSON.stringify(param)
    // Content-length的坑 由于中文问题 必须用buffer获取byte长度
    if (param !== '') { // 如果POST数据不是空，那么就重新根据数据类型，转换成字符串，然后计算。
      var dataLength = 0
      if (param instanceof Array) {
        // 数组类型的数据要转换成JSON字符串传递下去。
        param = JSON.stringify(param)
        dataLength = Buffer.byteLength(param, 'utf8')
         // dataLength = param.length
      } else {
        // 对象类型的数据直接传递JSON对象，但是Buffer.byteLength计算函数只接受字符串类型的参数。
        dataLength = Buffer.byteLength(JSON.stringify(param), 'utf8')
      }
      contentLength = dataLength
    } else { // 如果POST请求的内容为空，那么认为长度是0. 不参与以上计算过程，因为JSON.stringify('') = '""' 长度会变成2
      contentLength = 0
    }
  } else {
    let urlParamsStr = ''
    for(var i=0;i<Object.keys(param).length;i++){
      let paramKey = Object.keys(param)[i]
      urlParamsStr += (i===0?  '' : '&') + paramKey + "=" + param[paramKey]
    }
    paramsStr = Object.keys(param).length !== 0 ? (union + urlParamsStr) : ''
  }
  // 这里换掉https的验证 
  // let tempUrl = baseUrl[0].toLocaleLowerCase() + baseUrl[1] //htpps签名url必须是小写的
  let tempUrl = url // htpp签名url
  tempUrl = tempUrl.replace('api/', defaultConfig.API_ROOT) + paramsStr
  let baseString = method + tempUrl + contentLength
  // 对请求头进行认证处理
  let sign = md5(baseString + defaultConfig.cookieDomain)
  var auth = '';
  let userinfo = getStorage('userinfo')
  if (userinfo) {
    auth = userinfo.id + ' ' + md5(baseString + userinfo.token)
  }
  console.log(url)
  console.log(tempUrl)
  reqwest({
    url: url,
    method: method,
    data: params,
    type: 'json',
    headers:{
      "Accept":"application/json",
      "Cache-Control": "no-cache",
      "Content-Type": "application/json",
      "auth": auth,
      "sign": sign
    }
  }).then((resp)=>{
      if (resp.code === '200') {
        callBack(resp)
        if (tag === 'login') {
          setStorage('userinfo',resp.result)
        }
        // return resp
          // var data = resp.result
          // this.state.imId = data.id
          // this.state.header = data.header || this.state.header
          // this.loginIM(data.nick, this.state.header)
      } else {
          Demo.api.NotifyError(resp.message); 
      }
  })
}

module.exports =  fetch
