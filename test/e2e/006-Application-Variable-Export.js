const { v4: uuidv4 } = require('uuid');
var chai = require('chai');
chai.config.includeStack = true;
var path = require('path');
const os = require('os');
const fs = require('fs');
const fsPromises = fs.promises;
var Settings = require('./Settings.js');
const CommonSteps = require('./CommonSteps.js');
var expect = chai.expect;
var assert = chai.assert;
var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var driverPath = require('chromedriver').path;
var By = webdriver.By;
var Key = webdriver.Key;
var until = webdriver.until;
var commonSteps = new CommonSteps();

var driver;
var globalHomePageUrl = Settings.getConfiguratorUrl()+"/global-variable";
var applicationVariableHomePageUrl = Settings.getConfiguratorUrl()+"/application-variable";

var downloadDir = global.downloadDir;

describe('Application Variables: Export:'+downloadDir, function() {

  before(async function() {
    driver = global.driver;
  });

  it('an application without variables should download a json with empty collection', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('exportButton')).click();
    await driver.sleep(1000);

    var fileAsString = await fs.promises.readFile(path.join(downloadDir,appName+".json"),'utf8')
    var exportedVars = JSON.parse(fileAsString);

    expect(0).to.equal(exportedVars.length);

  });
  it('locals - should download a json with two plain variables', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var localVarName1 = uuidv4();
    var localVarValue1 = uuidv4();
    var localVarDesc1 = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, localVarName1, localVarValue1, localVarDesc1, "P", "Plain")

    var localVarName2 = uuidv4();
    var localVarValue2 = uuidv4();
    var localVarDesc2 = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, localVarName2, localVarValue2, localVarDesc2, "P", "Plain")

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('exportButton')).click();
    await driver.sleep(1000);

    var fileAsString = await fs.promises.readFile(path.join(downloadDir,appName+".json"),'utf8')
    var exportedVars = JSON.parse(fileAsString);

    expect(2).to.equal(exportedVars.length);

    var exportedAsObjectKey = {};
    for(var expVar of  exportedVars){
      exportedAsObjectKey[expVar.name]  = {
        value:expVar.value,
        description:expVar.description,
        type:expVar.type,
        scope:expVar.scope
      }
    }
    expect(localVarValue1).to.equal(exportedAsObjectKey[localVarName1].value);
    expect(localVarDesc1).to.equal(exportedAsObjectKey[localVarName1].description);
    expect("P").to.equal(exportedAsObjectKey[localVarName1].type);
    expect("L").to.equal(exportedAsObjectKey[localVarName1].scope);

    expect(localVarValue2).to.equal(exportedAsObjectKey[localVarName2].value);
    expect(localVarDesc2).to.equal(exportedAsObjectKey[localVarName2].description);
    expect("P").to.equal(exportedAsObjectKey[localVarName2].type);
    expect("L").to.equal(exportedAsObjectKey[localVarName2].scope);

  });

  it('locals - should download a json with two secret variables which are masked with *****', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var localVarName1 = uuidv4();
    var localVarValue1 = uuidv4();
    var localVarDesc1 = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, localVarName1, localVarValue1, localVarDesc1, "S", "Secret")

    var localVarName2 = uuidv4();
    var localVarValue2 = uuidv4();
    var localVarDesc2 = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, localVarName2, localVarValue2, localVarDesc2, "S", "Secret")

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('exportButton')).click();
    await driver.sleep(1000);

    var fileAsString = await fs.promises.readFile(path.join(downloadDir,appName+".json"),'utf8')
    var exportedVars = JSON.parse(fileAsString);

    expect(2).to.equal(exportedVars.length);

    var exportedAsObjectKey = {};
    for(var expVar of  exportedVars){
      exportedAsObjectKey[expVar.name]  = {
        value:expVar.value,
        description:expVar.description,
        type:expVar.type,
        scope:expVar.scope
      }
    }
    expect("*****").to.equal(exportedAsObjectKey[localVarName1].value);
    expect(localVarDesc1).to.equal(exportedAsObjectKey[localVarName1].description);
    expect("S").to.equal(exportedAsObjectKey[localVarName1].type);
    expect("L").to.equal(exportedAsObjectKey[localVarName1].scope);

    expect("*****").to.equal(exportedAsObjectKey[localVarName2].value);
    expect(localVarDesc2).to.equal(exportedAsObjectKey[localVarName2].description);
    expect("S").to.equal(exportedAsObjectKey[localVarName2].type);
    expect("L").to.equal(exportedAsObjectKey[localVarName2].scope);

  });

  it('globals - should download a json with two plain variables', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var globalVarName1 = uuidv4();
    var globalVarValue1 = uuidv4();
    var globalVarDesc1 = uuidv4();
    await commonSteps.createGlobalVariable(driver, globalVarName1, globalVarValue1, globalVarDesc1, "P", "Plain")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarName1);

    var globalVarName2 = uuidv4();
    var globalVarValue2 = uuidv4();
    var globalVarDesc2 = uuidv4();
    await commonSteps.createGlobalVariable(driver,  globalVarName2, globalVarValue2, globalVarDesc2, "P", "Plain")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarName2);

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('exportButton')).click();
    await driver.sleep(1000);

    var fileAsString = await fs.promises.readFile(path.join(downloadDir,appName+".json"),'utf8')
    var exportedVars = JSON.parse(fileAsString);

    expect(2).to.equal(exportedVars.length);

    var exportedAsObjectKey = {};
    for(var expVar of  exportedVars){
      exportedAsObjectKey[expVar.name]  = {
        value:expVar.value,
        description:expVar.description,
        type:expVar.type,
        scope:expVar.scope
      }
    }
    expect(globalVarValue1).to.equal(exportedAsObjectKey[globalVarName1].value);
    expect(globalVarDesc1).to.equal(exportedAsObjectKey[globalVarName1].description);
    expect("P").to.equal(exportedAsObjectKey[globalVarName1].type);
    expect("G").to.equal(exportedAsObjectKey[globalVarName1].scope);

    expect(globalVarValue2).to.equal(exportedAsObjectKey[globalVarName2].value);
    expect(globalVarDesc2).to.equal(exportedAsObjectKey[globalVarName2].description);
    expect("P").to.equal(exportedAsObjectKey[globalVarName2].type);
    expect("G").to.equal(exportedAsObjectKey[globalVarName2].scope);

  });

  it('globals - should download a json with two secret variables', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var globalVarName1 = uuidv4();
    var globalVarValue1 = uuidv4();
    var globalVarDesc1 = uuidv4();
    await commonSteps.createGlobalVariable(driver, globalVarName1, globalVarValue1, globalVarDesc1, "S", "Secret")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarName1);

    var globalVarName2 = uuidv4();
    var globalVarValue2 = uuidv4();
    var globalVarDesc2 = uuidv4();
    await commonSteps.createGlobalVariable(driver,  globalVarName2, globalVarValue2, globalVarDesc2, "S", "Secret")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarName2);

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('exportButton')).click();
    await driver.sleep(1000);

    var fileAsString = await fs.promises.readFile(path.join(downloadDir,appName+".json"),'utf8')
    var exportedVars = JSON.parse(fileAsString);

    expect(2).to.equal(exportedVars.length);

    var exportedAsObjectKey = {};
    for(var expVar of  exportedVars){
      exportedAsObjectKey[expVar.name]  = {
        value:expVar.value,
        description:expVar.description,
        type:expVar.type,
        scope:expVar.scope
      }
    }
    expect("*****").to.equal(exportedAsObjectKey[globalVarName1].value);
    expect(globalVarDesc1).to.equal(exportedAsObjectKey[globalVarName1].description);
    expect("S").to.equal(exportedAsObjectKey[globalVarName1].type);
    expect("G").to.equal(exportedAsObjectKey[globalVarName1].scope);

    expect("*****").to.equal(exportedAsObjectKey[globalVarName2].value);
    expect(globalVarDesc2).to.equal(exportedAsObjectKey[globalVarName2].description);
    expect("S").to.equal(exportedAsObjectKey[globalVarName2].type);
    expect("G").to.equal(exportedAsObjectKey[globalVarName2].scope);

  });

  it('mix - should download a json with plain, secret, local and global variables', async function() {

    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var globalVarName1 = uuidv4();
    var globalVarValue1 = uuidv4();
    var globalVarDesc1 = uuidv4();
    await commonSteps.createGlobalVariable(driver, globalVarName1, globalVarValue1, globalVarDesc1, "S", "Secret")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarName1);

    var globalVarName2 = uuidv4();
    var globalVarValue2 = uuidv4();
    var globalVarDesc2 = uuidv4();
    await commonSteps.createGlobalVariable(driver,  globalVarName2, globalVarValue2, globalVarDesc2, "P", "Plain")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarName2);

    var localVarName1 = uuidv4();
    var localVarValue1 = uuidv4();
    var localVarDesc1 = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, localVarName1, localVarValue1, localVarDesc1, "S", "Secret")

    var localVarName2 = uuidv4();
    var localVarValue2 = uuidv4();
    var localVarDesc2 = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, localVarName2, localVarValue2, localVarDesc2, "P", "Plain")

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('exportButton')).click();
    await driver.sleep(1000);

    var fileAsString = await fs.promises.readFile(path.join(downloadDir,appName+".json"),'utf8')
    var exportedVars = JSON.parse(fileAsString);

    expect(4).to.equal(exportedVars.length);

    var exportedAsObjectKey = {};
    for(var expVar of  exportedVars){
      exportedAsObjectKey[expVar.name]  = {
        value:expVar.value,
        description:expVar.description,
        type:expVar.type,
        scope:expVar.scope
      }
    }
    expect("*****").to.equal(exportedAsObjectKey[globalVarName1].value);
    expect(globalVarDesc1).to.equal(exportedAsObjectKey[globalVarName1].description);
    expect("S").to.equal(exportedAsObjectKey[globalVarName1].type);
    expect("G").to.equal(exportedAsObjectKey[globalVarName1].scope);

    expect(globalVarValue2).to.equal(exportedAsObjectKey[globalVarName2].value);
    expect(globalVarDesc2).to.equal(exportedAsObjectKey[globalVarName2].description);
    expect("P").to.equal(exportedAsObjectKey[globalVarName2].type);
    expect("G").to.equal(exportedAsObjectKey[globalVarName2].scope);

    expect("*****").to.equal(exportedAsObjectKey[localVarName1].value);
    expect(localVarDesc1).to.equal(exportedAsObjectKey[localVarName1].description);
    expect("S").to.equal(exportedAsObjectKey[localVarName1].type);
    expect("L").to.equal(exportedAsObjectKey[localVarName1].scope);

    expect(localVarValue2).to.equal(exportedAsObjectKey[localVarName2].value);
    expect(localVarDesc2).to.equal(exportedAsObjectKey[localVarName2].description);
    expect("P").to.equal(exportedAsObjectKey[localVarName2].type);
    expect("L").to.equal(exportedAsObjectKey[localVarName2].scope);

  });



});
