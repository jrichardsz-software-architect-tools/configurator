const uuid = require('uuid');
const bcrypt = require('bcrypt');

function DefaultUserConfigurator() {
  
  var saltRoundsGenerationNumber = 10;

  this.createUserIfNoExist = function(userName, role) {
    authenticationRepository.findOneByUserName(userName, function(err, userInformation) {
      if (err || userInformation.length == 0) {
        logger.info(userName+" was not found in database."+err);
        var plainPassword = uuid.v4();

        bcrypt.hash(plainPassword, saltRoundsGenerationNumber, function(err, hash) {

          if (err) {
            logger.error(err);
            return;
          }

          var entity = {
            "username": userName,
            "password": hash,
            "role": role
          };

          authenticationRepository.save(entity, function(saveErr, result) {
            if (saveErr) {
              logger.error(saveErr);
              logger.error(userName+" user cannot be created.");
              return;
            }
            logger.info(userName+" user was created with password : [{0}]".format(plainPassword));
          });
        });
      } else {
        logger.info(userName+" is already configured. If you lost the password, go to database and delete the "+userName+" user in authentication table.");
      }
    });
  }

}

module.exports = DefaultUserConfigurator;
