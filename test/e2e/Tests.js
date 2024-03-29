var chai = require('chai');
var Settings = require('./Settings.js');
var expect = chai.expect;
var assert = chai.assert;
var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var driverPath = require('chromedriver').path;
var By = webdriver.By;
var Key = webdriver.Key;
var until = webdriver.until;

require('./000-Config.js')
require('./001-Login.js')
require('./002-HomeApplication.js')
require('./003-Global-Variables.js')
require('./004-Application-Local-Variable.js')
require('./005-Application-Global-Variable.js')
require('./006-Application-Variable-Export.js')
require('./007-Application-Variable-Import-File-Validation.js')
require('./008-Application-Variable-Import-Locals.js')
require('./009-Application-Variable-Import-Globals.js')
require('./999-Last.js')
