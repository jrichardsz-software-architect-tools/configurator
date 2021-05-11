function ApiRouter(expressInstance) {
  var _this = this;

  var response400 = {
    "status": 400,
    "message": "Bad request"
  };

  expressInstance.get('/api/v1/variables', ["api"], (req, res) => {
    logger.info("get variables for app: "+req.query.application)

    var type;
    if(req.query.type === 'json' || req.query.type === 'env'){
      type = req.query.type;
    }else{
      type = 'env';
    }

    if(typeof req.query.application === 'undefined'){
      res.status(response400.status);
      createResponse(type, response400, res)
      return;
    }

    applicationVariableRepository.findVariablesByApplicationName(req.query.application, function(findVariablesByApplicationIdErr, variables) {

      if (findVariablesByApplicationIdErr) {
        logger.error(errVarApplications);
        res.status(response422.status);
        createResponse(type, response422, res)
        return;
      }

      if (variables && variables.length===0) {
        logger.error("zero variables were founded");
        res.status(response422.status);
        createResponse(type, response422, res)
        return;
      }

      try{
        var parsedVariables = getVariablesByType(type,variables);
        createResponse(type,parsedVariables, res);
      }catch(errParseVariables){
        logger.error("Failed to convert variables to type: "+type)
        res.status(response422.status);
        createResponse(type, response422, res)
        return;
      }
    });
  });

  function createResponse(type, body, res){
    if(type === 'json'){
      res.json(body);
    }else{
      res.type('text/plain');
      res.send(body);
    }
  }

  function getVariablesByType(type, variables){
    if(type === 'json'){
      var parsedVariables = [];
      variables.forEach(function(variableMetadata) {
        var key = variableMetadata.name;
        var value = variableMetadata.value;
        parsedVariables.push({
          "key":key,
          "value":value,
        });
      });

      var response = {
        "status": "200",
        "message": "success",
        "content": parsedVariables
      };

      return response;

    }else{ //default is env
      var exportText = '';
      variables.forEach(function(variableMetadata) {
        var key = variableMetadata.name;
        var value = variableMetadata.value;
        exportText =
          exportText +
          'export ' +
          key +
          '=' +
          '"' +
          value +
          '"' +
          ' \n';
      });
      return exportText;
    }
  }

}

module.exports = ApiRouter;
