var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = process.env.LOG_LEVEL || 'info';

function getCalleeInfo() {
  var stack = new Error().stack.split("at ");

  var functionInfo = "" + stack[3].trim();
  var fileLocation = functionInfo.substring(functionInfo.indexOf("(") + 1, functionInfo.indexOf(":"));
  var lineInfo = functionInfo.split(":");
  return {
    location: fileLocation.replace(appHomePath, ""),
    line: lineInfo[1]
  };
}

function Logger() {

}

Logger.info = function(message) {
  var calleeInfo = getCalleeInfo();
  logger.info("[" + calleeInfo.location + "]", "[" + calleeInfo.line + "]", message);
};

Logger.debug = function(message) {
  var calleeInfo = getCalleeInfo();
  logger.debug("[" + calleeInfo.location + "]", "[" + calleeInfo.line + "]", message);
};

Logger.error = function(message) {
  var calleeInfo = getCalleeInfo();
  logger.error("[" + calleeInfo.location + "]", "[" + calleeInfo.line + "]", message);
};

Logger.warn = function(message) {
  var calleeInfo = getCalleeInfo();
  logger.warn("[" + calleeInfo.location + "]", "[" + calleeInfo.line + "]", message);
};


module.exports = Logger;
