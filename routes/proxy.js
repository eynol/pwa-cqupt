var express = require('express')
var router = express.Router()
var http = require('http')
var querystring = require('querystring')
var zlib = require('zlib')

/* GET home page. */
router.get('/hitokoto', function (req, res, next) {
  var chuckList = []
  var _html = ''
  var ret = {}
  var _query = querystring.stringify({
    encode: 'json'
  })
  var _option = {
    method: 'GET',
    host: 'api.hitokoto.cn',
    port: 80,
    path: '/?' + _query,
    headers: {
      'Accept': '*/*; q=0.01',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
      'Host': 'api.hitokoto.cn',
      'Origin': 'https://cqupt.heitaov.cn',
      'Referer': req.headers.referer,
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko' +
        ') Chrome/57.0.2987.133 Safari/537.36'
    }
  }

  http.request(_option, function (_res) {
    var encoding = _res.headers['content-encoding']
    if (encoding === 'undefined') {
      res.setEncoding('utf-8')
    }

    _res
      .on('data', function (data) {
        chuckList.push(data)
      })
    _res.on('end', function () {
      var buffer = Buffer.concat(chuckList)
      if (encoding === 'gzip') {
        zlib.gunzip(buffer, function (err, decoded) {
          if (err) {
            throw err
          } else {
            resolve(decoded.toString())
          }
        })
      } else if (encoding === 'deflate') {
        zlib.inflate(buffer, function (err, decoded) {
          if (err) {
            throw err
          } else {
            resolve(decoded.toString())
          }
        })
      } else {
        resolve(buffer.toString())
      }

      function resolve(string) {
        try {
          ret = JSON.parse(string)
        } catch (err) {
          console.log('错误：' + new Date().toLocaleString())
          console.log(string)
          ret = {
            code: -1,
            msg: 'perse错误'
          }
        }
        res.json(ret)
      }
    })
  }).on('error', function (e) {
    console.log(e)
    res.json({
      code: 1,
      msg: '后台系统无法发出请求~请联系管理员~'
    })
  }).end()
})

module.exports = router
