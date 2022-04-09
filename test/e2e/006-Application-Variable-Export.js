const { v4: uuidv4 } = require('uuid');
var chai = require('chai');
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

var service = new chrome.ServiceBuilder(driverPath).build();
chrome.setDefaultService(service);
var driver;
var globalHomePageUrl = Settings.getConfiguratorUrl()+"/global-variable";
var applicationVariableHomePageUrl = Settings.getConfiguratorUrl()+"/application-variable";

var downloadDir = path.join(os.tmpdir(), uuidv4());

describe('Application Variables: Export', function() {

  before(async function() {

    await fsPromises.mkdir(downloadDir);
    console.log(downloadDir);

    driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().setUserPreferences(
        { "download.default_directory": downloadDir }
    ))
    .build();

    driver.manage().window().maximize();
    var applicationHomeTitle = await commonSteps.login(driver);
    expect(applicationHomeTitle).to.equal("Applications");

  });

  after(async function() {
    await driver.quit();
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

    await driver.sleep(3000)

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



});
