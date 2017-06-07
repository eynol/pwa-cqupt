var express = require('express');
var router = express.Router();
var http = require('http');
var querystring = require('querystring');
var classTools = require('../classtools')

var _host = 'jwc.cqupt.edu.cn'
var _path = '/showUserKebiao.php'

/* GET home page. */
router.get('/kebiao/:type/:id', function (req, res, next) {
    var chuckList = [];
    var _html = "";
    var _data = querystring.stringify({id: req.params.id, type: req.params.type});
    var _option = {
        method: 'POST',
        host: _host,
        port: 80,
        path: _path,
        headers: {
            'Accept': 'text/html, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
            'Host': 'jwc.cqupt.edu.cn',
            'Origin': 'http://jwc.cqupt.edu.cn',
            'Referer': 'http://jwc.cqupt.edu.cn/',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': _data.length,
            'User-Agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko' +
                    ') Chrome/57.0.2987.133 Safari/537.36'
        }
    };

    var oneshot = http.request(_option, function (_res) {
        _res
            .on('data', function (data) {
                chuckList.push(data);
            });
        _res.on('end', function () {
            _html = Buffer
                .concat(chuckList)
                .toString('utf-8');

            var list = classTools.html2array(_html);
            if (list.length > 0) {
                res.json({code: 0, time: req.query.t, id: req.params.id, list: list});

            } else {
                res.json({code: 2, msg: "暂未查询到您的课表！"})
            }
        });
    })
    oneshot.write(_data);
    oneshot.end();
    oneshot.on('error', function (e) {
        res.json({code: 1, msg: "后台系统无法发出请求~请联系管理员~"})
    })

    // res.json({ title: 'Express' });
});

module.exports = router;
