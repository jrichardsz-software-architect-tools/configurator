const uuid = require('uuid');
const bcrypt = require('bcrypt');
const Utils = require('../common/Utils.js');

function SecureExpress() {

  var _this = this;
  var exceptions = null;
  var staticAssets = null;
  var apiEndpoints = null;
  var loginEndpoints = null;
  var expressIntance = null;
  var rolesByRoute = {};
  var blackListBruteIps = {};
  var defaultBfaThreshold = 50;
  //each 24h suspicious attacks are restarted
  var cleanUpBlackListIntervalMillis = 24*3600*1000;

  var response401 = {
    "status": 401,
    "message": "Unauthorized access"
  };

  var response422 = {
    "status": 422,
    "message": "Unprocessable response"
  };

  var response500 = {
    "status": 500,
    "message": "Internal error. BFA."
  };

  this.setLoginEndpoints = function(loginEndpoints) {
    _this.loginEndpoints = loginEndpoints;
  }

  this.setStaticAssets = function(staticAssets) {
    _this.staticAssets = staticAssets;
  }

  this.setApiEndpoints = function(apiEndpoints) {
    _this.apiEndpoints = apiEndpoints;
  }

  this.setExpressInstance = function(expressIntance) {
    _this.expressIntance = expressIntance;
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

  this.authorizeEntrance = function(req, res, next) {

    logger.debug("validating url: "+req.originalUrl);
    req.session.referer = req.get('referer')

    //if does not have a valid information in session
    if(!Utils.hasProperty(req, "session.loginInformation.user")){
      if(isExactMatch(req.originalUrl, _this.loginEndpoints)){ //login endpoints
        logger.debug("login endpoint");
        return next();
      }else if(isContained(req.originalUrl, _this.apiEndpoints)){ //api endpoint
        logger.debug("api endpoint. Another security strategy will be applied");
        return next();
      }else if(isContained(req.originalUrl, _this.staticAssets)){ //assets
        logger.debug("asset endpoint");
        return next();
      }else { //is unknown
        logger.debug("unknown endpoint");
        res.redirect('/login');
        return;
      }
    }else{
      logger.debug("url is authorized: "+req.originalUrl);
      //already has user session. security is not required
      return next();
    }

  }

  this.validateInteractiveAccess = function(req, res, next) {

    let allowedRolesForThisRoute;

    if(typeof req.session.loginInformation === 'undefined'){
      allowedRolesForThisRoute = ["anonymous"];
    }else{
      if(typeof _this.rolesByRoute[req.route.path] === 'undefined'){
        logger.error("This route:"+req.route.path+" does not have any registered role.");
      }else{
        allowedRolesForThisRoute = _this.rolesByRoute[req.route.path];
      }
    }


    if(typeof req.session.loginInformation === 'undefined'){
      if(!req.route.path.startsWith('/login')){
        logger.error("session.loginInformation is null and just /login/.. endpoints are allowed. Requested route:"+req.route.path);
        res.redirect('/login');
        return
      }
      //there ir not a valid session and is login, go!
      next()
    }else{
      //exist a login information for this user
      //user has the required role for access to this route
      if(allowedRolesForThisRoute.includes(req.session.loginInformation.role)){
        logger.debug('access is allowed for this role:'+req.session.loginInformation.role);
        next();
      }else{
        //user does not have the required role
        logger.error(`Just ${allowedRolesForThisRoute} are allowed to access to this route: ${req.route.path}`);
        logger.error(`Current user role: ${req.session.loginInformation.role}`);
        logger.error(`You will be redirected to home page`);
        req.session.error_security_message = "You are not allowed to perform this operation.";
        res.redirect(req.session.referer);
      }
    }

  }

  this.validateNonInteractiveAccess = function(req, res, next) {
    var clientRemoteIp = Utils.getIp(req);
    if(blackListBruteIps[clientRemoteIp]>_this.getBfaThreshold()){
      logger.error("brute force attack ip detected : "+clientRemoteIp+" for these parameters:" +req.originalUrl);
      res.status(response500.status);
      res.json(response500);
      return;
    }

    var incomingApiKey = req.headers['apikey'];
    var apiKey;
    try{
      apiKey = properties.api.key;
    }catch(e){
      logger.error("api.key does not exist in configuration. Is API_KEY env var exported?");
      res.status(response422.status);
      res.json(response422);
      return;
    }

    if (typeof apiKey === 'undefined' || apiKey.length == 0) {
      logger.error("apikey from configuration is wrong or empty.");
      res.status(response422.status);
      res.json(response422);
      return;
    }

    if (typeof incomingApiKey === 'undefined' || incomingApiKey.length == 0) {
      logger.error("apikey http header is wrong or empty.");
      res.status(response422.status);
      res.json(response422);
      //update count for this ip
      blackListBruteIps[clientRemoteIp] = (blackListBruteIps[clientRemoteIp]==null ? 0:blackListBruteIps[clientRemoteIp]) +1;
      return;
    }

    if (incomingApiKey===apiKey) {
      blackListBruteIps[clientRemoteIp] = 0;
      next();
    }else{
      logger.error("Incoming api key in header are not equal to configured value");
      res.status(response401.status);
      res.json(response401);
      //update count for this ip
      blackListBruteIps[clientRemoteIp] = (blackListBruteIps[clientRemoteIp]==null ? 0:blackListBruteIps[clientRemoteIp]) +1;
      return;
    }

  }

  this.get = function(route, allowedRoles, callback) {
    if(typeof _this.rolesByRoute === 'undefined'){
      _this.rolesByRoute = {};
    }
    _this.rolesByRoute[route] = allowedRoles;
    if(allowedRoles.includes("api")){
      _this.expressIntance.get(route,_this.validateNonInteractiveAccess, callback);
    }else{
      _this.expressIntance.get(route,_this.validateInteractiveAccess, callback);
    }
  }

  this.post = function(route, allowedRoles, callback) {
    if(typeof _this.rolesByRoute === 'undefined'){
      _this.rolesByRoute = {};
    }
    _this.rolesByRoute[route] = allowedRoles;
    if(allowedRoles.includes("api")){
      _this.expressIntance.post(route,_this.validateNonInteractiveAccess, callback);
    }else{
      _this.expressIntance.post(route,_this.validateInteractiveAccess, callback);
    }
  }

  this.configure = function() {
    _this.expressIntance.use(_this.authorizeEntrance);
  }

  this.getBfaThreshold = function() {
    if(Utils.hasProperty(properties, "security.bfaThreshold")){
      return new Number(properties.security.bfaThreshold);
    }else{
      return defaultBfaThreshold;
    }
  }

  setInterval(function() {
    logger.info("clean up black list ip used to protect against bfa.");
    logger.info(blackListBruteIps);
    blackListBruteIps = [];
  }, cleanUpBlackListIntervalMillis);

}

module.exports = SecureExpress;
