const uuid = require('uuid');
const fs = require('fs');
const bcrypt = require('bcrypt');
const osUtil = require('os');

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
            var homePath = osUtil.homedir();
            var filePassword = `${homePath}/configurator-user-${userName}.txt`;
            fs.writeFile(`${filePassword}`, plainPassword, function(err) {
                if(err) {
                  logger.info(`${userName} user was not created. You will not be able to access the system`);
                  logger.error(err);
                }
                logger.info(`${userName} user was created. Password is in ${filePassword}. READ AND DELETE IT!!!`);
            });
          });
        });
      } else {
        logger.info(userName+" is already configured. If you lost the password, go to database and delete the "+userName+" user in authentication table.");
      }
    });
  }

}

module.exports = DefaultUserConfigurator;
