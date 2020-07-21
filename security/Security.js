const uuid = require('uuid');
const bcrypt = require('bcrypt');
const Utils = require('../common/Utils.js');

function Security() {

  var _this = this;
  var exceptions = null;
  var staticAssets = null;
  var apiEndpoints = null;
  var loginEndpoints = null;
  var saltRoundsGenerationNumber = 10;

  this.setLoginEndpoints = function(loginEndpoints) {
    _this.loginEndpoints = loginEndpoints;
  }

  this.setStaticAssets = function(staticAssets) {
    _this.staticAssets = staticAssets;
  }

  this.setApiEndpoints = function(apiEndpoints) {
    _this.apiEndpoints = apiEndpoints;
  }

  function isAllowed(item, collection) {
    for (let key in collection) {
      if (item.startsWith(collection[key])) {
        return true;
      }
    }
    return false;
  }
  function isContained(item, collection) {
    for (let key in collection) {
      if (item.startsWith(collection[key])) {
        return true;
      }
    }
    return false;
  }

  function isExactMatch(item, collection) {
    for (let key in collection) {
      if (item.startsWith(collection[key])) {
        return true;
      }
    }
    return false;
  }

  this.authorize = function(req, res, next) {

    logger.debug("authorize url: "+req.originalUrl);

    if(!Utils.hasProperty(req, "session.loginInformation.user")){
      if(isExactMatch(req.originalUrl, _this.loginEndpoints)){ //login endpoints
        return next();
      }else if(isContained(req.originalUrl, _this.apiEndpoints)){ //api endpoint
        logger.debug("api endpoint. Another security will be applied");
        return next();
      }else if(isContained(req.originalUrl, _this.staticAssets)){ //assets
        return next();
      }else { //is unknown
        res.redirect('/login');
        return;
      }
    }else{
      //already has user session. security is not required
      return next();
    }

  }

  this.configureAdminCredentials = function() {
    authenticationRepository.findOneByUser("admin", function(err, userInformation) {
      if (err || userInformation.length == 0) {
        logger.error(err);
        logger.error("The existence of the admin user cannot be determined.");
        logger.info("Admin was not found in database");
        var plainPassword = uuid.v4();

        bcrypt.hash(plainPassword, saltRoundsGenerationNumber, function(err, hash) {

          if (err) {
            logger.error(err);
            return;
          }

          var entity = {
            "user": "admin",
            "password": hash,
            "role": "admin"
          };

          authenticationRepository.save(entity, function(saveErr, result) {
            if (saveErr) {
              logger.error(saveErr);
              logger.error("admin user cannot be created.");
              return;
            }
            logger.info("admin user was created with password : [{0}]".format(plainPassword));
          });
        });
      } else {
        logger.info("Admin is already configured. If you lost the password, go to database and delete admin user in authentication table.");
      }
    });
  }

}

module.exports = Security;
