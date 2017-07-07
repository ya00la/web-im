// 本文件只做 返回请求结果 不对结果进行任何处理
let ApiResource =require('./resource.js')
  // 获取项目列表
  // let getProjectList = 'bb'
module.exports = {
  // 用户登录
  userLogin: (data,callBack) => ApiResource('api/user/loginByPassword','POST',data,callBack,'login'),
  // 获取群组列表
  getCrowdList: (data,callBack) => ApiResource('api/crowd/list','GET',data,callBack),
  // 获取群成员列表v2
  getCrowdMemberList: (data,callBack) => ApiResource('api/crowd/member/list','GET',data,callBack)
  // 获取群公告列表
  // getCrowdNoticeList: (data,callBack) => ApiResource('api/crowd/crowdnoticelist','GET',data,callBack)
}