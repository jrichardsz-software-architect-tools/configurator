var appName = "app-" + Math.floor((Math.random() * 999999) + 100000);
var appDesc = "desc-" + Math.floor((Math.random() * 999999) + 100000);
var globalName = "global-name-" + Math.floor((Math.random() * 999999) + 100000);
var globalValue = "global-value-" + Math.floor((Math.random() * 999999) + 100000);
var globalDesc = "global-desc-" + Math.floor((Math.random() * 999999) + 100000);
var localVariableName = "global-name-" + Math.floor((Math.random() * 999999) + 100000);
var localVariableValue = "global-value-" + Math.floor((Math.random() * 999999) + 100000);
var localVariableDesc = "global-desc-" + Math.floor((Math.random() * 999999) + 100000);

process.env.APP_NAME=appName
process.env.APP_DESC=appDesc

process.env.GLOBAL_NAME=globalName
process.env.GLOBAL_VALUE=globalValue
process.env.GLOBAL_DESC=globalDesc

process.env.LOCAL_VARIABLE_NAME=localVariableName
process.env.LOCAL_VARIABLE_VALUE=localVariableValue
process.env.LOCAL_VARIABLE_DESC=localVariableDesc

console.log("app: "+process.env.APP_NAME);
console.log("global: "+process.env.GLOBAL_NAME);

require('./001-Login.js')
require('./002-HomeApplication.js')
require('./003-Global-Variables.js')
require('./004-Application-Local-Variable.js')
require('./005-Application-Global-Variable.js')
require('./006-Application-Variable-Export.js')
