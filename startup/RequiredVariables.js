const Utils = require('../common/Utils.js');

function RequiredVariables() {

  this.startValidation = function() {
    logger.info("validating required variables...")
    if(!Utils.hasProperty(properties, "security.cryptKey")){
      throw new Error("CONFIGURATOR_CRYPT_KEY env variable is required to save secrets in database");
    }
  }

}

module.exports = RequiredVariables;
