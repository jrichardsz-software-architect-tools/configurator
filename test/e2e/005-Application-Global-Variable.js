const { v4: uuidv4 } = require('uuid');
var chai = require('chai');
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

describe('Application Global Variables', function() {

  before(async function() {
    driver = global.driver;
  });

  it('global var - should be returned to the global home page with app selected when cancel button is clicked', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('addGlobalVariableButton')).click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(appName));

    var cancelButton = await driver.findElements(By.id("cancelAddGlobalVarButton"));
    await cancelButton[0].click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectedElementsAfter = await driver.findElements(By.css("select[name='applicationId']"));
    var selectedApplicationElementsAfter = await selectedElementsAfter[0].findElements(By.xpath('//option[@selected]'));
    var selectedApplicationNameText = await selectedApplicationElementsAfter[0].getText();
    expect(selectedApplicationNameText).to.equal(appName);

  });


  it('global var - should work the global addition of several vars and should appear in result table', async function() {

    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc);

    //create two vars
    var globalVarId1 = "foo-"+ Math.floor((Math.random() * 999999) + 100000);
    var globalVarId2 = "foo-"+ Math.floor((Math.random() * 999999) + 100000);

    await commonSteps.createGlobalVariable(driver, globalVarId1, globalVarId1, globalVarId1, "S", "Secret")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarId1)

    await commonSteps.createGlobalVariable(driver, globalVarId2, globalVarId2, globalVarId2, "P", "Plain")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarId2)

  });


  it('global var - should work the global deletion and should disappear in result table', async function() {

    var appName = uuidv4();
    var appDesc = uuidv4();
    var globalVarId1 = "foo-"+ Math.floor((Math.random() * 999999) + 100000);

    //create app
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc);
    // create global
    await commonSteps.createGlobalVariable(driver, globalVarId1, globalVarId1, globalVarId1, "P", "Plain")
    //add global to app
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, globalVarId1)
    //delete global from app

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    //get the rows to delete by name
    var rowsCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var expectedColumnsContainingTheGlobalToBeDeleted;
    for (var webElementRow of rowsCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisAppName = await tdElements[1].getText();
      if (thisAppName.trim() == (globalVarId1)) {//is the creted global?
        expectedColumnsContainingTheGlobalToBeDeleted = tdElements;
        break;
      }
    }

    var deleteButton = await expectedColumnsContainingTheGlobalToBeDeleted[6].findElements(By.css("a[title='Delete']"));
    await deleteButton[0].click();

    //validate the title of delete form
    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle).to.equal("delete");

    //get disclaimer which is inside of form
    var deleteForm = await driver.findElements(By.css("form[action='/application-variable/action/delete']"));
    var rawDisclaimer = await deleteForm[0].getText();

    //disclaimer shoould contain the name of global to delete
    expect(true).to.equal(rawDisclaimer.includes(appName));
    expect(true).to.equal(rawDisclaimer.includes(globalVarId1));

    //click on delete button
    var buttonDeleteApp = await driver.findElements(By.css("button[type='submit']"));
    await buttonDeleteApp[0].click();

    //validate the disappear of the deleted var in the result table
    var rowsAfterCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));

    //search the global in the table
    var globalWasFound = false;
    for (var webElementRow of rowsAfterCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var currentGlobalName = await tdElements[1].getText();
      if(currentGlobalName==globalVarId1){
        globalWasFound = true;
        break;
      }
    }

    expect(false).to.equal(globalWasFound);
  });



});
