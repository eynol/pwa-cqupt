var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/s', function (req, res, next) {
  console.log('here')
  res.render('index.html')
})

module.exports = router
