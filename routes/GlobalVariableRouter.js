const Utils = require('../common/Utils.js');

var aes256 = require('aes256');

function GlobalVariableRouter(expressInstance) {

  var _this = this;
  var cryptKey = properties.security.cryptKey;

  expressInstance.get('/global-variable', ["admin", "reader"], (req, res) => {
    _this.goToHomePage(req, res);
  });

  this.goToHomePage = function(req, res, redirectAttributes) {

    variableRepository.findByScopeAndDeleted("G","N", function(err, entities) {

      if (err) {
        logger.info(err);
        var renderAttributes = {
          error_message: "An error occurred when trying to list global variables.",
          error_security_message: req.session.error_security_message || undefined
        };
        req.session.error_security_message = undefined;

        res.render('global-variable/home.hbs', renderAttributes);
        return;
      }

      var renderAttributes = {
        globalVariables: entities,
        error_security_message: req.session.error_security_message || undefined,
        userRole: req.session.loginInformation.role || undefined
      };

      req.session.error_security_message = undefined;

      Object.assign(renderAttributes, redirectAttributes);
      res.render('global-variable/home.hbs', renderAttributes);
    });
  }

  expressInstance.get('/global-variable/view/new', ["admin"], (req, res) => {
    res.render('global-variable/new.hbs', {"mode":"add"});
  });

  expressInstance.post('/global-variable/action/save', ["admin"], (req, res) => {

    logger.info("Save global variable:");
    req.body.scope = 'G';

    var variable = Object.assign({}, req.body);

    let objectToLog = {...req.body}; objectToLog.value = "****";
    logger.info(objectToLog);

    //safe value store
    if(variable.type === "S"){
      variable.value = aes256.encrypt(cryptKey, variable.value);
    }

    variableRepository.save(variable, function(err, result) {
      if (err) {
        logger.info(err);
        if(err.code === 'ER_DUP_ENTRY'){
          res.render('global-variable/new.hbs', {
            error_message: "A variable already exist with provided name: "+req.body.name,
            "mode":"add"
          });
        }else{
          res.render('global-variable/new.hbs', {
            error_message: "An error occurred when trying to save the global variable.",
            "mode":"add"
          });
        }
      } else {
        _this.goToHomePage(req, res, {
          redirect: '/global-variable',
          success_message: "The global variable was saved successfully."
        })
      }
    });
  });

  expressInstance.get('/global-variable/view/edit/:id', ["admin"], (req, res) => {

   variableRepository.findOneById(req.params.id,function(err,variable){
     if (err) {
       logger.info(err);
       _this.goToHomePage(req, res, {
         error_message: "An error occurred when trying to get the global variable."
       })
     } else {
       //decr variable value to allow edit
       if(variable.type === "S"){
         variable.value = aes256.decrypt(cryptKey, variable.value);
       }
       res.render('global-variable/new.hbs', {
         global:variable,
         "mode":"edit"
       });
     }
   });
  });

  expressInstance.get('/global-variable/view/read/:id', ["reader"], (req, res) => {

   variableRepository.findOneById(req.params.id,function(err,entity){
     if (err) {
       logger.info(err);
       _this.goToHomePage(req, res, {
         error_message: "An error occurred when trying to read the global variable."
       })
     } else {

       if(entity.type === 'S'){
         entity.value = "*****"
       }

       res.render('global-variable/read.hbs', {
         variable:entity
       });
     }
   });
  });

  expressInstance.get('/global-variable/view/delete/:id', ["admin"], (req, res) => {

    variableRepository.findOneById(req.params.id,function(err,variable){
      if (err) {
        logger.info(err);
        homeRouter.goToHomePage(req, res, {
          error_message: "An error occurred when trying to get the variable."
        })
      } else {

        applicationVariableRepository.findApplicationsByVariableById(variable.id, function(findApplicationsByVariableByIdErr, applications){

          if(applications.length > 0){
            var appsString = Utils.arrayToSimpleRepresentation(applications,"name", ",");
            res.render('common/delete.hbs', {
              entityId:variable.id,
              warningMessage:`You can not delete this variable ${variable.name} because it is required in these applications : ${appsString}.`,
              entityType:"global-variable",
              "mode":"cannot-delete"
            });
          }else{
            res.render('common/delete.hbs', {
              entityId:variable.id,
              warningMessage:"Are you sure you want to delete this variable: {0}".format(variable.name),
              entityType:"global-variable",
              "mode":"confirm"
            });
          }
        });
      }
    });
  });

  expressInstance.post('/global-variable/action/delete', ["admin"], (req, res) => {

    logger.info("Delete variable:");
    variableRepository.delete(req.body.id, function(err, result) {
      if (err) {
        logger.info(err);
        res.render('common/delete.hbs', {
          error_message: "An error occurred when trying to delete this variable."
        });
      } else {
        _this.goToHomePage(req, res, {
          redirect: '/global-variable',
          success_message: "The variable was deleted successfully."
        })
      }
    });
  });


}

module.exports = GlobalVariableRouter;
