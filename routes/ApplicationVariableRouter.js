var aes256 = require('aes256');

function ApplicationVariableRouter(expressInstance) {

  var cryptKey = properties.security.cryptKey;
  var _this = this;

  expressInstance.get('/application-variable', ["admin", "reader"], (req, res) => {
    _this.goToHomePage(req, res);
  });

  this.goToHomePage = function(req, res, redirectAttributes) {

    applicationRepository.findByDeleted("N", function(err, entities) {

      if (err) {
        logger.info(err);
        let renderAttributes = {
          error_message: "An error occurred when trying to list applications.",
          error_security_message: req.session.error_security_message || undefined
        };
        req.session.error_security_message = undefined;
        res.render('application-variable/home.hbs', renderAttributes);
        return;
      }

      var renderAttributes = {
        applications: entities,
        javascriptModule: 'application-variable'
      };

      if (req.query.applicationId && req.query.applicationId != "-1") {
        logger.info("Selected application:" + req.query.applicationId)
        renderAttributes.selectedApplicationId = req.query.applicationId;
        Object.assign(renderAttributes, redirectAttributes);
        applicationVariableRepository.findVariablesByApplicationId(req.query.applicationId, function(errVarApplications, entities) {

          if (errVarApplications) {
            logger.info(errVarApplications);
            req.query.applicationId = null;

            let renderAttributes = {
              error_message: "An error occurred when trying to list variables for this application:" + req.query.applicationName,
              error_security_message: req.session.error_security_message || undefined
            };
            req.session.error_security_message = undefined;

            _this.goToHomePage(req, res, renderAttributes)
            return;
          }

          renderAttributes.variables = entities;
          renderAttributes.error_security_message = req.session.error_security_message || undefined
          renderAttributes.userRole = req.session.loginInformation.role || undefined
          res.render('application-variable/home.hbs', renderAttributes);
        });
      } else {
        renderAttributes.redirect = '/application-variable';
        Object.assign(renderAttributes, redirectAttributes);
        res.render('application-variable/home.hbs', renderAttributes);
      }
    });
  }

  expressInstance.get('/application-variable/view/:selectedApplicationId/:scope/new', ["admin"], (req, res) => {

    var scope = req.params.scope;
    var applicationId = req.params.selectedApplicationId;

    //validate id application exist
    applicationRepository.findOneById(applicationId, function(err, application){
      if (err) {
        logger.info(err);
        let renderAttributes = {
          error_message: "An error occurred when trying to get the application.",
          error_security_message: req.session.error_security_message || undefined
        };
        req.session.error_security_message = undefined;
        res.render('application-variable/home.hbs', renderAttributes);
        return;
      }

      //if application exist, show variables options
      if (scope == "local") {
        res.render('application-variable/new_local_var.hbs', {
          application_id: applicationId,
          application_name: application.name,
          mode: "add"
        });
      } else if (scope == "global") {

        applicationVariableRepository.findVariablesByApplicationId(applicationId, function(selectApplicationVariablesErr, applicationVariables) {
          if (selectApplicationVariablesErr) {
            logger.error(selectApplicationVariablesErr);
            _this.goToHomePage(req, res, {
              redirect: '/application-variable',
              error_message: "Variables cannot be obtained for selected application."
            })
          } else {
            variableRepository.findByScopeAndDeleted("G","N",function(selectGlobalVariablesErr, globalVariables){
              if (selectGlobalVariablesErr) {
                logger.error(selectGlobalVariablesErr);
                _this.goToHomePage(req, res, {
                  redirect: '/application-variable',
                  error_message: "Global variables cannot be obtained."
                })
              } else {

                var availableGlobalVariables = [];

                for(var globalVariablesIndex in globalVariables){
                  logger.debug("search "+globalVariables[globalVariablesIndex].id+" in");
                  if(!contains(globalVariables[globalVariablesIndex].id,"variable_id",applicationVariables)){
                    availableGlobalVariables.push(globalVariables[globalVariablesIndex]);
                  }
                }

                res.render('application-variable/add_global_var.hbs', {
                  application_id: req.params.selectedApplicationId,
                  variables: availableGlobalVariables,
                  application_name: application.name
                });
              }
            });
          }
        });
      }

    })

  });

  function contains(searchedValue, attributeName, array ){
    for(var key in array){
      if(array[key][attributeName] == searchedValue){
        return true;
      }
    }
    return false;
  }

  expressInstance.post('/application-variable/action/local/variable/save', ["admin"], (req, res) => {

    logger.info("Save variable:");
    var variable = Object.assign({}, req.body);
    delete variable.application_id;
    delete variable.variable_id;

    variable.scope = 'L';

    if (req.body.variable_id) {
      variable.id = req.body.variable_id;
    }

    let objectToLog = {...variable}; objectToLog.value = "****";
    logger.info(objectToLog);

    //safe value store
    if(variable.type === "S"){
      variable.value = aes256.encrypt(cryptKey, variable.value);
    }

    //save variable
    variableRepository.save(variable, function(err, variableSaveResult) {
      if (err) {
        logger.error(`Error while trying to persist variable: ${err.code} ${err.sqlMessage}`);
        res.render('application-variable/new_local_var.hbs', {
          error_message: "An error occurred when trying to save the variable."
        });
      } else {
        console.log(variableSaveResult);
        //if variable is already created or updated, we just need to match variable
        // with selected application
        if (!req.body.variable_id) {
          var application_variable = {
            application_id: req.body.application_id,
            variable_id: variableSaveResult.insertId
          };
          applicationVariableRepository.save(application_variable, function(applicationVariableErr, applicationVariableResult) {

            if (applicationVariableErr) {
              logger.error(applicationVariableErr);
              logger.info("previously created variable will be deleted");
              variableRepository.delete(variableSaveResult.insertId, function(errDelete, deleteResult) {

                res.render('application-variable/new_local_var.hbs', {
                  error_message: "An error occurred when trying to save the variable."
                });
              });

            } else {
              _this.goToHomePage(req, res, {
                redirect: '/application-variable',
                success_message: "The variable was saved successfully."
              })
            }
          });
        } else {
          _this.goToHomePage(req, res, {
            redirect: '/application-variable',
            success_message: "The variable was edited successfully."
          })
        }
      }
    });
  });

  expressInstance.post('/application-variable/action/global/variable/add', ["admin"], (req, res) => {

    logger.info("Add global variables:");
    logger.debug(req.body);
    logger.debug(typeof req.body);

    var selectedApplicationId = req.body.application_id;

    var columns = ["application_id", "variable_id"];
    var variables_id = [];

    for(var key in req.body){
      if(key.startsWith("global_var_id_selected_")){
        variables_id.push(key.replace("global_var_id_selected_",""))
      }
    }

    applicationVariableRepository.massiveSave(columns, selectedApplicationId, variables_id,function(applicationVariableErr, applicationVariableResult){
      if (applicationVariableErr) {
        logger.info(applicationVariableErr);
        //TODO: Show error message in add global variable page instead home page
        _this.goToHomePage(req, res, {
          redirect: '/application-variable',
          error_message: "An error occurred when trying to add the variable. Application was not found"
        })
      } else {
        _this.goToHomePage(req, res, {
          redirect: '/application-variable',
          success_message: "The variables were added successfully."
        })
      }
    });

  });

  expressInstance.get('/application-variable/view/edit/:id/:application_id/:variable_id', ["admin"], (req, res) => {

    variableRepository.findOneById(req.params.variable_id, function(err, variable) {
      if (err) {
        logger.info(err);
        _this.goToHomePage(req, res, {
          error_message: "An error occurred when trying to get the variable."
        })
      } else {
        if(variable.type === "S"){
          variable.value = aes256.decrypt(cryptKey, variable.value);
        }
        res.render('application-variable/new_local_var.hbs', {
          id: req.params.id,
          application_id: req.params.application_id,
          variable: variable,
          mode: "edit"
        });
      }
    });
  });

  expressInstance.get('/application-variable/view/read/:application_id/:variable_id', ["reader"], (req, res) => {

    applicationRepository.findOneById(req.params.application_id, function(err, application) {
      if (err) {
        logger.info(err);
        _this.goToHomePage(req, res, {
          error_message: "An error occurred when trying to read the application."
        })
      } else {
        variableRepository.findOneById(req.params.variable_id, function(err, entity) {
          if (err) {
            logger.info(err);
            _this.goToHomePage(req, res, {
              error_message: "An error occurred when trying to read the variable."
            })
          } else {

            entity.applicationFrom = application.name
            entity.originUrl = req.get('referer')

            if(entity.type === 'S'){
              entity.value = "{secret}"
            }

            res.render('application-variable/read_var.hbs', {
              id: req.params.id,
              application_id: req.params.application_id,
              variable: entity
            });
          }
        });
      }
    });
  });

  expressInstance.get('/application-variable/view/delete/:id/:scope', ["admin"], (req, res) => {

    var id = req.params.id;

    applicationVariableRepository.findOneById(id, function(err, applicationVariable) {
      if (err) {
        logger.info(err);
        _this.goToHomePage(req, res, {
          error_message: "An error occurred when trying to get the deletion page."
        })
      } else {

        variableRepository.findOneById(applicationVariable.variable_id, function(errVariable, variable) {
          if (errVariable) {
            logger.error(errVariable);
            _this.goToHomePage(req, res, {
              error_message: "An error occurred when trying to get the deletion page."
            })
          } else {
            applicationRepository.findOneById(applicationVariable.application_id, function(errApplication, application) {
              if (errApplication) {
                logger.error(errApplication);
                _this.goToHomePage(req, res, {
                  error_message: "An error occurred when trying to get the deletion page."
                })
              } else {
                res.render('common/delete.hbs', {
                  entityId: id,
                  additionalFormValues: [{
                    "name": "scope",
                    "value": req.params.scope
                  }],
                  warningMessage: "Are you sure you want to delete this {0} variable: \"{1}\" from this application \"{2}\"?".format(req.params.scope, variable.name, application.name),
                  entityType: "application-variable",
                  "mode":"confirm"
                });
              }
            });
          }
        });
      }
    });
  });

  expressInstance.post('/application-variable/action/delete', ["admin"], (req, res) => {

    var id = req.body.id;
    var variableScope = req.body.scope;

    if (variableScope != "global" && variableScope != "local") {
      _this.goToHomePage(req, res, {
        error_message: "An error occurred when trying to delete the variable: Unknown scope"
      })
    }

    logger.info("Deleting variable from application. Relationship id:" + id);

    // validate existence of this application <> variable  relationship
    applicationVariableRepository.findOneById(id, function(selectionApplicationVariableErr, applicationVariable) {
      if (selectionApplicationVariableErr) {
        logger.error(selectionApplicationVariableErr);
        _this.goToHomePage(req, res, {
          redirect: '/application-variable',
          error_message: "An error occurred when trying to delete this variable."
        })
        return;
      } else {

        logger.info("Relationship was found:" + applicationVariable)
        if (variableScope == "global") {
          // in this case we need to delete just the relationship
          applicationVariableRepository.delete(id, function(deletionApplicationVariableErr, deletionApplicationVariableResult) {
            if (deletionApplicationVariableErr) {
              logger.error(deletionApplicationVariableErr);
              _this.goToHomePage(req, res, {
                error_message: "An error occurred when trying to delete the variable."
              })
            } else {
              _this.goToHomePage(req, res, {
                redirect: '/application-variable',
                success_message: "The global variable was removed from the application successfully."
              })
            }
          });

        } else if (variableScope == "local") {
          // first: delete the asociation variable <> application
          applicationVariableRepository.delete(id, function(deletionApplicationVariableErr, deletionApplicationVariableResult) {
            if (deletionApplicationVariableErr) {
              logger.error(deletionApplicationVariableErr);
              _this.goToHomePage(req, res, {
                error_message: "An error occurred when trying to delete the variable."
              })
            } else {
              // second: delete the orphan variable
              variableRepository.delete(applicationVariable.variable_id, function(variableDeletionErr, variableDeletionResult) {
                if (variableDeletionErr) {
                  logger.error(variableDeletionErr);
                  _this.goToHomePage(req, res, {
                    error_message: "An error occurred when trying to delete the variable."
                  })
                } else {
                  _this.goToHomePage(req, res, {
                    redirect: '/application-variable',
                    success_message: "The variable was deleted successfully."
                  })
                }
              });
            }
          });
        }
      }
    });
  });
}

module.exports = ApplicationVariableRouter;
