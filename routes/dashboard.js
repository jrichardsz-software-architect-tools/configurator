var express = require('express');
var router = express.Router();
const request = require('request');
var jsonPath = require('jsonpath');

router.get('/', function(req, res, next) {

  request(process.env.DOCKERD_API_REST_BASE_URL+'/containers/json', { json: true }, (err, httpRes, body) => {
    if (err) { return console.log(err); }

    var containers = [];

    for(key in body){
      var port = jsonPath.query(body[key],"$.Ports[0].PublicPort");
      containers.push({
        "name":body[key].Names[0].replace("/",""),
        "image":body[key].Image,
        "port":port[0]
      });
    }
    res.render('dashboard', { containers: containers });
  });


});



module.exports = router;
