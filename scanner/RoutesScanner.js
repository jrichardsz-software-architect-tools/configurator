const fs = require('fs');
const path = require('path');

var routesBasePath = appHomePath + '/routes';

function RoutesScanner() {

}

RoutesScanner.scan = function(expressInstance) {
  logger.info( "Automatic scanning of routes...");
  fs.readdirSync(routesBasePath).forEach(function(file) {
    var ext = path.extname(file);
    if (ext !== ".js") {
      return;
    }

    logger.info( "New router detected:" + file);
    var routerRequire = require(routesBasePath + "/" + file);
    var router = new routerRequire(expressInstance);
    var routeName = path.basename(file).replace(ext,"");
    var routeInstanceName = routeName.charAt(0).toLowerCase() + routeName.slice(1);
    global[routeInstanceName] = router;
    logger.info( "Router [" + routeInstanceName+"] was registered in global context.");
  });
};


module.exports = RoutesScanner;
