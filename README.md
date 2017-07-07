##  kaistart WEB IM 项目介绍

 实现功能（群，陌生人）之间的文本、表情、图片、文件的传输

 开发代码放在project文件夹下的src目录下,src/entry.js为入口文件 

 1、project/common/主要为整个webIM的配置文件

 2、project/sdk/ 环信webIM的sdk文件
 
 3、project/webrtc/是一个支持网页浏览器进行实时语音对话或视频对话的js库，项目中没有用到


打包运行，环境变量 NODE_ENV='production' || 'dev' || 'test',在不输入环境变量时，默认是test环境





## 环信 WebIM sdk

测试环信WebIM请访问：https://webim.easemob.com

更多关于环信的开发文档请见：https://docs.easemob.com


## 

## QA

### Q: IE8下总是提示**拒绝访问**

A: 请确保自己的demo地址是否通过web服务，以http协议访问
   
原因见： [XDomainRequest](https://developer.mozilla.org/zh-CN/docs/Web/API/XDomainRequest)

```
XDomainRequest为了确保安全构建，采用了多种方法。
- 安全协议源必须匹配请求的URL。（http到http，https到https）。如果不匹配，请求会报“拒绝访问”的错误。
```


### no such file or directory, scandir 'node_modules/node-sass/vendor'

`npm rebuild node-sass` is the official solution. Deleting your node_modules and running `npm install` will also do the trick.

https://github.com/sass/node-sass/issues/1579




