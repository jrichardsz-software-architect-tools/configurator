function ApplicationVariableRouter(expressInstance) {

  var _this = this;

  expressInstance.get('/application-variable', (req, res) => {
    _this.goToHomePage(req, res);
  });

  this.goToHomePage = function(req, res, redirectAttributes) {

    applicationRepository.findByDeleted("N", function(err, entities) {

      if (err) {
        logger.info(err);
        res.render('application-variable/home.hbs', {
          error_message: "An error occurred when trying to list applications."
        });
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
            _this.goToHomePage(req, res, {
              error_message: "An error occurred when trying to list variables for this application:" + req.query.applicationName
            })
            return;
          }

          renderAttributes.variables = entities;
          res.render('application-variable/home.hbs', renderAttributes);
        });
      } else {
        renderAttributes.redirect = '/application-variable';
        Object.assign(renderAttributes, redirectAttributes);
        res.render('application-variable/home.hbs', renderAttributes);
      }
    });
  }

  expressInstance.get('/application-variable/view/:selectedApplicationId/:scope/new', (req, res) => {

    var scope = req.params.scope;
    var applicationId = req.params.selectedApplicationId;

    if (scope == "local") {
      res.render('application-variable/new_local_var.hbs', {
        application_id: applicationId
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
                console.log("search "+globalVariables[globalVariablesIndex].id+" in");
                if(!contains(globalVariables[globalVariablesIndex].id,"variable_id",applicationVariables)){
                  availableGlobalVariables.push(globalVariables[globalVariablesIndex]);
                }
              }

              res.render('application-variable/add_global_var.hbs', {
                application_id: req.params.selectedApplicationId,
                variables: availableGlobalVariables
              });
            }
          });
        }
      });
    }
  });

  function contains(searchedValue, attributeName, array ){
    for(var key in array){
      if(array[key][attributeName] == searchedValue){
        return true;
      }
    }
    return false;
  }

  expressInstance.post('/application-variable/action/local/variable/save', (req, res) => {

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
    //save variable
    variableRepository.save(variable, function(err, variableSaveResult) {
      if (err) {
        logger.info(err);
        res.render('application-variable/new.hbs', {
          error_message: "An error occurred when trying to save the variable."
        });
      } else {
        //if variable is already created or updated, we just need to match variable
        // with selected application
        if (!req.body.variable_id) {
          var application_variable = {
            application_id: req.body.application_id,
            variable_id: variableSaveResult.insertId
          };
          applicationVariableRepository.save(application_variable, function(applicationVariableErr, applicationVariableResult) {

            if (applicationVariableErr) {
              logger.info(applicationVariableErr);
              res.render('application-variable/new.hbs', {
                error_message: "An error occurred when trying to save the variable."
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

  expressInstance.post('/application-variable/action/global/variable/add', (req, res) => {

    logger.info("Add global variable:");
    var selectedApplicationId = req.body.application_id;
    var selectedGlobalVariableId = req.body.selectedGlobalVariableId;

    var application_variable = {
      application_id: selectedApplicationId,
      variable_id: selectedGlobalVariableId
    };

    applicationVariableRepository.save(application_variable,function(applicationVariableErr, applicationVariableResult){
      if (applicationVariableErr) {
        logger.info(applicationVariableErr);
        //TODO: Show error message in add global variable page instead home page
        _this.goToHomePage(req, res, {
          redirect: '/application-variable',
          error_message: "An error occurred when trying to add the variable."
        })
      } else {
        _this.goToHomePage(req, res, {
          redirect: '/application-variable',
          success_message: "The variable was added successfully."
        })
      }
    });

  });

  expressInstance.get('/application-variable/view/edit/:id/:application_id/:variable_id', (req, res) => {

    variableRepository.findOneById(req.params.variable_id, function(err, entity) {
      if (err) {
        logger.info(err);
        _this.goToHomePage(req, res, {
          error_message: "An error occurred when trying to get the variable."
        })
      } else {
        res.render('application-variable/new_local_var.hbs', {
          id: req.params.id,
          application_id: req.params.application_id,
          variable: entity
        });
      }
    });
  });

  expressInstance.get('/application-variable/view/delete/:id/:scope', (req, res) => {

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
                  warningMessage: "Are you sure you want to delete this {0} variable: \"{1}\" from this application \"{2}\"".format(req.params.scope, variable.name, application.name),
                  entityType: "application-variable",
                });
              }
            });
          }
        });
      }
    });
  });

  expressInstance.post('/application-variable/action/delete', (req, res) => {

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
