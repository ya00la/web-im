// https://www.npmjs.com/package/crypto-js
var CryptoJS = require('crypto-js')
var secret = {}
var key // 秘钥。可以随意配置。对加密的信息进行解密的时候，要使用加密的时候的秘钥。
key = CryptoJS.SHA256('Kkaistart').toString() // 更改key会让原来的加密数据不可用, 可以在解密的时候尝试使用上次的密钥解密，看是否解密成功。
/**
 * encrypt加密，decrypt解密数据
 * @param  {[String]} data [将要加密或解密的数据]
 * @return {[String]}      [最终加密或解密的结果]
 */
secret.encrypt = function (data) {
  let ciphertext = CryptoJS.AES.encrypt(data, key)
  return ciphertext.toString()
}
secret.decrypt = function (data) {
  let bytes = CryptoJS.AES.decrypt(data, key)
  try {
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (e) {}
  return '""'
}
module.exports = secret
