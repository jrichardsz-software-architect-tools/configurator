const uuid = require('uuid');
const bcrypt = require('bcrypt');

function Security() {

  var _this = this;
  var exceptions = null;
  var saltRoundsGenerationNumber = 10;

  this.setExceptions = function(exceptions) {
    _this.exceptions = exceptions;
  }

  function isStaticAsset(item, collection) {
    for (let key in collection) {
      if (item.startsWith(collection[key])) {
        return true;
      }
    }
    return false;
  }

  this.authorize = function(req, res, next) {

    if (isStaticAsset(req.originalUrl, _this.exceptions)) {
      return next();
    } else if (!req.session.loginInformation || req.session.loginInformation.user == "") {
      res.redirect('/login');
      return;
    } else {
      return next();
    }
  }

  this.configureAdminCredentials = function() {
    authenticationRepository.findOneByUser("admin", function(err, userInformation) {
      if (err) {
        logger.error(err);
        logger.error("The existence of the admin user cannot be determined.");
        return;
      }

      if (userInformation.length == 0) {
        logger.info("Admin was not found in database");
        var plainPassword = uuid.v4();

        bcrypt.hash(plainPassword, saltRoundsGenerationNumber, function(err, hash) {

          if(err){
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
