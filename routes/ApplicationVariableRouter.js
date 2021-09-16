var aes256 = require('aes256');
const fs = require('fs');
const Utils = require('../common/Utils.js');
const ApplicationVariableService = require(appHomePath+'/service/ApplicationVariableService.js');
var applicationVariableService = new ApplicationVariableService();
const util = require('util');
const readFile = util.promisify(fs.readFile);

function ApplicationVariableRouter(expressInstance) {

  var cryptKey = properties.security.cryptKey;
  var dummySecret = aes256.encrypt(cryptKey, "changeme");
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

      var applicationId;
      if (req.query.application_id && req.query.application_id != "-1") {
        applicationId = req.query.application_id;
      } else if (typeof redirectAttributes !== 'undefined' && typeof redirectAttributes.application_id !== 'undefined' && redirectAttributes.application_id != "-1") {
        applicationId = redirectAttributes.application_id;
      }

      logger.info("Selected application:" + applicationId)
      if (applicationId && applicationId != "-1") {
        renderAttributes.selectedApplicationId = applicationId;
        Object.assign(renderAttributes, redirectAttributes);
        applicationVariableRepository.findVariablesByApplicationId(applicationId, function(errVarApplications, entities) {

          if (errVarApplications) {
            logger.info(errVarApplications);
            req.query.applicationId = null;

            let renderAttributes = {
              error_message: "An error occurred when trying to list variables of selected application.",
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
    applicationRepository.findOneById(applicationId, function(err, application) {
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
        return res.render('application-variable/new_local_var.hbs', {
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
            variableRepository.findByScopeAndDeleted("G", "N", function(selectGlobalVariablesErr, globalVariables) {
              if (selectGlobalVariablesErr) {
                logger.error(selectGlobalVariablesErr);
                _this.goToHomePage(req, res, {
                  redirect: '/application-variable',
                  error_message: "Global variables cannot be obtained."
                })
              } else {

                var availableGlobalVariables = [];

                for (var globalVariablesIndex in globalVariables) {
                  logger.debug("search " + globalVariables[globalVariablesIndex].id + " in");
                  if (!Utils.arrayContainsObject(globalVariables[globalVariablesIndex].id, "variable_id", applicationVariables)) {
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

  expressInstance.get('/application-variable/action/:selectedApplicationId/variables/export', ["admin", "reader"], (req, res) => {

    var applicationId = req.params.selectedApplicationId;
    applicationRepository.findOneById(applicationId, function(err, application) {
      if (err) {
        logger.info(err);
        res.type('text/html');
        res.send("An error occurred while trying to find the selected application");
      }

      applicationVariableRepository.findVariablesByApplicationId(applicationId, function(selectApplicationVariablesErr, applicationVariables) {

        var variables = [];
        applicationVariables.forEach(function(variable) {
          variables.push({
            "name": variable.name,
            "value": variable.type === "S" ? "*****" : variable.value,
            "description": variable.description,
            "type": variable.type,
            "scope": variable.scope,
          });
        });

        res.set({
          "Content-Disposition": `attachment; filename=\"${application.name}.json\"`
        });
        res.send(JSON.stringify(variables, null, 4));
      });

    });

  });

  expressInstance.post('/application-variable/action/:selectedApplicationId/variables/import', ["admin", "reader"], async (req, res) => {

    var applicationId = req.params.selectedApplicationId;
    var resultMessages = [];

    if (!req.files || Object.keys(req.files).length === 0) {
      return _this.goToHomePage(req, res, {
        redirect: '/application-variable',
        error_message: 'No files were uploaded.',
        application_id: applicationId
      })
    }

    // Accessing the file by the <input> File name="import_file"
    let targetFile = req.files.import_file;
    if (targetFile.mimetype !== 'application/json') {
      return _this.goToHomePage(req, res, {
        redirect: '/application-variable',
        error_message: "File type is not allowed: " + targetFile.mimetype + ". Just json files are allowed.",
        application_id: applicationId
      })
    }

    var rawVariablesToImportStrin;
    try {
      rawVariablesToImportString = await readFile(targetFile.tempFilePath, "utf8");
    } catch (err) {
      return _this.goToHomePage(req, res, {
        redirect: '/application-variable',
        error_message: err,
        application_id: applicationId
      })
    }


    var incomingVariablesToImport;
    try {
      incomingVariablesToImport = JSON.parse(rawVariablesToImportString);
    } catch (err) {
      return _this.goToHomePage(req, res, {
        redirect: '/application-variable',
        error_message:"Not valid json. "+ err,
        application_id: applicationId
      })
    }

    if(!Array.isArray(incomingVariablesToImport) || incomingVariablesToImport.length == 0 ){
      return _this.goToHomePage(req, res, {
        redirect: '/application-variable',
        warning_message:"json is empty or is not a collection of variables",
        application_id: applicationId
      })
    }

    var safeReceivedVariables = Utils.obfuscateFieldAndTrimInArray(incomingVariablesToImport, "value", "****", 10);
    logger.info("received variables to import")
    logger.info(safeReceivedVariables);
    //get sub sets of the received variables
    //these subsets are variables that not exist
    var readyToInsertGlobals = await applicationVariableService.getNewVariablesReadyToInsertByScope(incomingVariablesToImport, "G");
    var readyToInsertLocals = await applicationVariableService.getNewVariablesReadyToInsertByScope(incomingVariablesToImport, "L");
    logger.info("globals ready to insert");
    logger.info(Utils.arrayObjecsToArrayValues(readyToInsertGlobals, "name"));
    logger.info("locals ready to insert");
    logger.info(Utils.arrayObjecsToArrayValues(readyToInsertLocals, "name"));

    //globals
    //if readyToInsertGlobals length == 0, it means that exist as variables
    //just we need to determine if were added to this application

    //if readyToInsertGlobals length > 0, user wants to import some globals
    //these global variables does not exist in table: variable
    //if it does not exist in its table, it does not exist in application_variable

    if(readyToInsertGlobals.length == 0){
      logger.info("All the received globals already exist.");
      //get the global names of received
      var receivedGlobalNames = Utils.arrayObjecsToArrayValuesFilterByField(incomingVariablesToImport,"name", "scope","G");
      logger.info(receivedGlobalNames);
      resultMessages.push({level:"warning", message:"Globals already exist: "+receivedGlobalNames})
      //search if globals were added to this application
      var alreadyGlobalsInApplication = await applicationVariableRepository.findAlreadyExistentVariablesInApplicationByNamesAndScope(applicationId, receivedGlobalNames, "G");
      //if 3 were received and 3 already exist in this application
      if(alreadyGlobalsInApplication.length == receivedGlobalNames.length){
        resultMessages.push({level:"warning", message:"Globals have already been added to this application: "+detectedGlobals})
        logger.info("All the received globals have already been added to this application");
      }else{
        //there are some globals which exist but are not yet in this application
        logger.info("there are some globals which exist but are not yet in this application");
        var receivedGlobalVariablesFullData = await variableRepository.findVariablesByNamesAndScope(receivedGlobalNames, "G");
        var applicationVariables = [];
        receivedGlobalVariablesFullData.forEach((variable, i) => {
          applicationVariables.push([applicationId, variable.id]);
        });
        logger.info("adding these globals to this application");
        logger.info(applicationVariables);
        await applicationVariableRepository.bulkInsert("application_id, variable_id", applicationVariables);
        resultMessages.push({level:"success", message:"Globals were added to this application successfully"})
      }
    }else{
      try {
        //step 1 : insert the variables
        await variableRepository.bulkInsert("name, value, description, type, scope", readyToInsertGlobals);
        resultMessages.push({level:"success", message:"Globals were created successfully"})
        logger.info("Globals were created successfully");
        //due to mysql behavior, after bulk insert, we don't have its primary keys.
        //we need to query them
        var variableNames = Utils.arrayObjecsToArrayValuesWithFilter(readyToInsertGlobals, "name", "scope", "G");
        var recentlyCreatedVariablesFullData = await variableRepository.findVariablesByNamesAndScope(variableNames, "G");
        //step 2: retrieve the ids of created variables
        // create an array with the new variable ids
        var applicationVariables = [];
        recentlyCreatedVariablesFullData.forEach((variableId, i) => {
          applicationVariables.push([applicationId, variableId.id]);
        });
        //step 3: add the global variables to the application
        await applicationVariableRepository.bulkInsert("application_id, variable_id", applicationVariables);
        resultMessages.push({level:"success", message:"Globals were added to this application successfully"})
        logger.info("Globals were added to this application successfully");
      } catch (err) {
        logger.error(err)
        return _this.goToHomePage(req, res, {
          redirect: '/application-variable',
          error_message: err,
          application_id: applicationId
        })
      }
    }


    //locals
    //if readyToInsertLocals length == 0, it means that exist as variables
    //if exist as variables, it means that another application created them
    //so, there is nothing to do here!

    //if readyToInsertLocals length > 0, user want to import globals
    //these local variables does not exist in table: variable
    //if it does not exist in its table, it does not exist in application_variable

    if(readyToInsertLocals.length == 0){
      resultMessages.push({level:"warning", message:"Locals already exist in this application or others: "+Utils.arrayObjecsToArrayValuesFilterByField(incomingVariablesToImport,"name", "scope","L")})
      //TODO: show in which application this variables already exist
      logger.info("Locals already exist in this application or others");
    }else{
      try {
        //step 1 : insert the variables
        await variableRepository.bulkInsert("name, value, description, type, scope", readyToInsertLocals);
        resultMessages.push({level:"success", message:"Locals were created successfully"})
        logger.info("Locals were created successfully");
        //due to mysql behavior, after bulk insert, we don't have its primary keys.
        //we need to query them
        var variableNames = Utils.arrayObjecsToArrayValuesWithFilter(readyToInsertLocals, "name", "scope", "L");
        var recentlyCreatedVariablesFullData = await variableRepository.findVariablesByNamesAndScope(variableNames, "L");
        //step 2: retrieve the ids of created variables
        // create an array with the new variable ids
        var applicationVariables = [];
        recentlyCreatedVariablesFullData.forEach((variableId, i) => {
          applicationVariables.push([applicationId, variableId.id]);
        });
        //step 3: add the global variables to the application
        await applicationVariableRepository.bulkInsert("application_id, variable_id", applicationVariables);
        resultMessages.push({level:"success", message:"Locals were added to this application successfully"})
      } catch (err) {
        logger.error(err)
        return _this.goToHomePage(req, res, {
          redirect: '/application-variable',
          error_message: err,
          application_id: applicationId
        })
      }
    }


    return _this.goToHomePage(req, res, {
      redirect: '/application-variable',
      multiple_messages: resultMessages,
      application_id: applicationId
    })

  });

  expressInstance.post('/application-variable/action/local/variable/save', ["admin"], (req, res) => {

    var variable = Object.assign({}, req.body);
    delete variable.application_id;
    delete variable.variable_id;

    variable.scope = 'L';

    if (req.body.variable_id) {
      variable.id = req.body.variable_id;
    }

    let objectToLog = {
      ...variable
    };
    objectToLog.value = "****";
    logger.info(objectToLog);

    //safe value store
    if (variable.type === "S") {
      variable.value = aes256.encrypt(cryptKey, variable.value);
    }

    //save variable
    variableRepository.save(variable, function(err, variableSaveResult) {
      if (err) {
        logger.error(`Error while trying to persist variable: ${err.code} ${err.sqlMessage}`);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.render('application-variable/new_local_var.hbs', {
            error_message: "A variable local or global already exist with provided name: " + variable.name,
            application_id: req.body.application_id
          });
        } else {
          return res.render('application-variable/new_local_var.hbs', {
            error_message: "An error occurred when trying to save the variable.",
            application_id: req.body.application_id
          });
        }
      } else {
        console.log("variable was created");
        // if variable is already created or updated, we just need add it
        // to  selected application
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
                  error_message: "An error occurred when trying to save the variable.",
                  application_id: req.body.application_id
                });
              });

            } else {
              _this.goToHomePage(req, res, {
                redirect: '/application-variable',
                success_message: "The variable was saved successfully.",
                application_id: req.body.application_id
              })
            }
          });
        } else {
          _this.goToHomePage(req, res, {
            redirect: '/application-variable',
            success_message: "The variable was edited successfully.",
            application_id: req.body.application_id
          })
        }
      }
    });
  });

  expressInstance.post('/application-variable/action/global/variable/add', ["admin"], (req, res) => {

    logger.info("Add global variables:");
    logger.debug(req.body);

    var selectedApplicationId = req.body.application_id;

    var columns = ["application_id", "variable_id"];
    var variables_id = [];

    for (var key in req.body) {
      if (key.startsWith("global_var_id_selected_")) {
        variables_id.push(key.replace("global_var_id_selected_", ""))
      }
    }

    applicationVariableRepository.massiveSave(columns, selectedApplicationId, variables_id, function(applicationVariableErr, applicationVariableResult) {
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
          success_message: "The variables were added successfully.",
          application_id: req.body.application_id
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
        if (variable.type === "S") {
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

            if (entity.type === 'S') {
              entity.value = "*****"
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
                  "mode": "confirm"
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
