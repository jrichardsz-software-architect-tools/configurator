const fs = require('fs');
const path = require('path');

var basePath = appHomePath + '/database/repository';

function DatabaseRepositoryScanner() {

}

DatabaseRepositoryScanner.scan = function() {
  logger.info( "Automatic scanning of database repositories...");
  fs.readdirSync(basePath).forEach(function(file) {
    var ext = path.extname(file);
    if (ext !== ".js") {
      return;
    }

    logger.info( "New repository detected:" + file);
    var moduleRequire = require(basePath + "/" + file);
    var moduleInstance = new moduleRequire();
    var moduleName = path.basename(file).replace(ext,"");
    var moduleInstanceVariableName = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);
    global[moduleInstanceVariableName] = moduleInstance;
    logger.info( "Repository [" + moduleInstanceVariableName+"] was registered in global context.");
  });
};


module.exports = DatabaseRepositoryScanner;
