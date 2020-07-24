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

    logger.debug("authorize url: "+req.originalUrl);
    req.session.referer = req.get('referer')

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
      logger.debug("url is authorized: "+req.originalUrl);
      //already has user session. security is not required
      return next();
    }

  }
  
  this.preAutorize = function(req, res, next) {
    
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
  
  this.get = function(route, allowedRoles, callback) {
    if(typeof _this.rolesByRoute === 'undefined'){
      _this.rolesByRoute = {};
    }    
    _this.rolesByRoute[route] = allowedRoles;
    _this.expressIntance.get(route,_this.preAutorize, callback);
  }  
  
  this.post = function(route, allowedRoles, callback) {
    if(typeof _this.rolesByRoute === 'undefined'){
      _this.rolesByRoute = {};
    }
    _this.rolesByRoute[route] = allowedRoles;
    _this.expressIntance.post(route,_this.preAutorize, callback);
  }  
  
  this.configure = function() {
    _this.expressIntance.use(_this.authorizeEntrance);
  }  

}

module.exports = SecureExpress;
