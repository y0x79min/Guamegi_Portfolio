var express = require('express');
var router = express.Router();
const requestIp = require('request-ip');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  let today = new Date();  
  console.log("["+today.toLocaleString() +']'+' /get / = '+requestIp.getClientIp(req));
  
	
  res.sendfile(path.join(__dirname, '../public/index.html')); 
  
});

module.exports = router;
