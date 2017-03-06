var express = require('express');
var router = express.Router();
var http = require('http');
var querystring = require('querystring');
var classTools = require('../classtools')

var _host = 'jwc.cqupt.edu.cn'
var _path = '/showUserKebiao.php'


/* GET home page. */
router.get('/kebiao/:type/:id', function(req, res, next) {

  var _html = "";
  var _data = querystring.stringify({
            id:req.params.id,
            type:req.params.type
        });
  var _option = {
        method: 'POST',
        host: _host,
        port: 80,
        path: _path,
        headers: {
            'Host':'jwc.cqupt.edu.cn',
            'Origin':'http://jwc.cqupt.edu.cn',
            'X-Requested-With':'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': _data.length,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
        }
    };

   var oneshot =  http.request(_option,function (_res) {
        _res.on('data', function (data) {
            _html += data;
        });
        _res.on('end', function () {
            // var $ = cheerio.load(html);
            //  $('.main').find('table').find('tr').each(function(i,ele){
            //      title.push($(this).find('h1').find('a').text().trim());
            //  });
            //  callback()
            res.json({code:0,id:req.params.id,list:classTools.html2array(_html)});
        });
    })
    oneshot.write(_data);
    oneshot.end();
    oneshot.on('error', function (e) {
        res.json({code:1,msg:"error on request"})
      })


 // res.json({ title: 'Express' });
});

module.exports = router;
