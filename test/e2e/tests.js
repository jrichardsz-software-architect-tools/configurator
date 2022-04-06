var appName = "app-" + Math.floor((Math.random() * 999) + 100);
var appDesc = "desc-" + Math.floor((Math.random() * 999) + 100);

process.env.APP_NAME=appName
process.env.APP_DESC=appDesc

console.log("app:"+process.env.APP_NAME);

// require('./001-Login.js')
require('./002-HomeApplication.js')
