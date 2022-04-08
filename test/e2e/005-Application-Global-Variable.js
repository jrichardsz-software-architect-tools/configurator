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

var service = new chrome.ServiceBuilder(driverPath).build();
chrome.setDefaultService(service);
var driver;
var globalHomePageUrl = Settings.getConfiguratorUrl()+"/global-variable";
var applicationVariableHomePageUrl = Settings.getConfiguratorUrl()+"/application-variable";

describe('Application Variables', function() {

  before(async function() {
    driver = await new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      .build();

    var applicationHomeTitle = await commonSteps.login(driver);
    expect(applicationHomeTitle).to.equal("Applications");

  });

  after(async function() {
    await driver.quit();
  });

  it('app-variables - should appear in the select the created application', async function() {

    await commonSteps.createApplication(driver);
    await driver.get(applicationVariableHomePageUrl);
    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + process.env.APP_NAME + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('newLocalVariableButton'));
    await driver.findElement(By.id('addGlobalVariableButton'));
    await driver.findElement(By.id('exportButton'));
    await driver.findElement(By.id('importButton'));

  });

  it('app-variables: add local var - should work the local plain variable creation and should appear in the result table ', async function() {

    await driver.get(applicationVariableHomePageUrl);
    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + process.env.APP_NAME + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('newLocalVariableButton')).click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(process.env.APP_NAME));

    var nameBox = await driver.findElement(By.name('name'));
    await nameBox.sendKeys(process.env.LOCAL_VARIABLE_NAME);

    var valueBox = await driver.findElement(By.css("textarea[name='value']"));
    await valueBox.sendKeys(process.env.LOCAL_VARIABLE_VALUE);

    var descriptionBox = await driver.findElement(By.css("input[name='description']"));
    await descriptionBox.sendKeys(process.env.LOCAL_VARIABLE_DESC);

    await driver.findElement(By.css("select[name='type'] > option[value=P]")).click();

    var buttonCreateGlobal = await driver.findElements(By.css("button[type='submit']"));
    await buttonCreateGlobal[0].click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var success_message = await driver.findElement(By.css(".alert.alert-success")).getText();
    expect(success_message.trim()).to.equal("The variable was saved successfully.");

    var rowsAfterCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));

    var localVariableWasFound = false;
    var localVariableTypeFound;
    var localVariableValueFound;
    for (var webElementRow of rowsAfterCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var currentGlobalName = await tdElements[1].getText();
      if(currentGlobalName==process.env.LOCAL_VARIABLE_NAME){
        localVariableWasFound = true;
        localVariableTypeFound = await tdElements[2].getText();
        localVariableValueFound = await tdElements[3].getText();
        break;
      }
    }

    expect(true).to.equal(localVariableWasFound);
    expect(localVariableTypeFound).to.equal("Plain");
    expect(false).to.equal(localVariableValueFound.includes("*"));

  });

  it('app-variables: edit local plain var - should work the local plain variable edition, value should be readable and should appear in the result table ', async function() {

    await driver.get(applicationVariableHomePageUrl);
    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + process.env.APP_NAME + '"]'))
    await selectedApplicationElement[0].click();

    //at this point, the variables was created.
    //I just need to search the row, get the edit button and click on it
    var rowsCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    //iterate rows looking for the second column which contains the app name
    var expectedColumnsContainingTheLocalVariableToBeEdited;
    for (var webElementRow of rowsCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisGlobalName = await tdElements[1].getText();
      if (thisGlobalName.trim() == process.env.LOCAL_VARIABLE_NAME) {
        expectedColumnsContainingTheLocalVariableToBeEdited = tdElements;
        break;
      }
    }

    var editButton = await expectedColumnsContainingTheLocalVariableToBeEdited[6].findElements(By.css("a[title='Edit']"));
    await editButton[0].click();

    //validate the text: Editing local variable of: app-1067-edited
    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(process.env.APP_NAME));

    var nameBox = await driver.findElement(By.name('name'));
    nameBox.clear();
    await nameBox.sendKeys(process.env.LOCAL_VARIABLE_NAME+"-edited");

    var valueBox = await driver.findElement(By.css("textarea[name='value']"));
    valueBox.clear();
    await valueBox.sendKeys(process.env.LOCAL_VARIABLE_VALUE+"-edited");

    var descriptionBox = await driver.findElement(By.css("input[name='description']"));
    descriptionBox.clear();
    await descriptionBox.sendKeys(process.env.LOCAL_VARIABLE_DESC+"-edited");

    await driver.findElement(By.css("select[name='type'] > option[value=S]")).click();

    var buttonCreateGlobal = await driver.findElements(By.css("button[type='submit']"));
    await buttonCreateGlobal[0].click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var success_message = await driver.findElement(By.css(".alert.alert-success")).getText();
    expect(success_message.trim()).to.equal("The variable was edited successfully.");

    var rowsAfterCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));

    var localVariableWasFound = false;
    var localVariableTypeFound;
    var localVariableValueFound;
    for (var webElementRow of rowsAfterCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var currentGlobalName = await tdElements[1].getText();
      if(currentGlobalName==process.env.LOCAL_VARIABLE_NAME+"-edited"){
        localVariableWasFound = true;
        localVariableTypeFound = await tdElements[2].getText();
        localVariableValueFound = await tdElements[3].getText();
        break;
      }
    }

    expect(true).to.equal(localVariableWasFound);
    expect(localVariableTypeFound).to.equal("Secret");
    expect(true).to.equal(localVariableValueFound.includes("*"));

  });

  it('app-variables: edit local secret var - secret value should be readable in edition mode', async function() {

    await driver.get(applicationVariableHomePageUrl);
    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + process.env.APP_NAME + '"]'))
    await selectedApplicationElement[0].click();

    //at this point, the variables was created.
    //I just need to search the row, get the edit button and click on it
    var rowsCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    //iterate rows looking for the second column which contains the app name
    var expectedColumnsContainingTheLocalVariableToBeEdited;
    for (var webElementRow of rowsCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisGlobalName = await tdElements[1].getText();
      if (thisGlobalName.trim() == process.env.LOCAL_VARIABLE_NAME+"-edited") {
        expectedColumnsContainingTheLocalVariableToBeEdited = tdElements;
        break;
      }
    }

    var editButton = await expectedColumnsContainingTheLocalVariableToBeEdited[6].findElements(By.css("a[title='Edit']"));
    await editButton[0].click();

    //validate the text: Editing local variable of: app-1067-edited
    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(process.env.APP_NAME));

    var secretValue = await driver.findElement(By.css("textarea[name='value']")).getText();
    expect(secretValue).to.equal(process.env.LOCAL_VARIABLE_VALUE+"-edited");

  });

  it('app-variables: add global var - should work the global addition and should appear in result table', async function() {
    //create two vars
    var globalVarId1 = "foo-"+ Math.floor((Math.random() * 999999) + 100000);
    var globalVarId2 = "foo-"+ Math.floor((Math.random() * 999999) + 100000);
    await commonSteps.createGlobalVariable(driver, globalHomePageUrl, globalVarId1, globalVarId1, globalVarId1, "S", "Secret")
    await commonSteps.createGlobalVariable(driver, globalHomePageUrl, globalVarId2, globalVarId2, globalVarId2, "P", "Plain")

    await driver.get(applicationVariableHomePageUrl);
    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + process.env.APP_NAME + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('addGlobalVariableButton')).click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(process.env.APP_NAME));

    //search the global variable and add
    var rowsCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    //iterate rows looking for the second column which contains the app name
    var expectedColumnsContainingTheGlobalVariableToBeAdded1;
    var expectedColumnsContainingTheGlobalVariableToBeAdded2;
    for (var webElementRow of rowsCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisGlobalName = await tdElements[0].getText();
      if (thisGlobalName.trim() == globalVarId1) {
        expectedColumnsContainingTheGlobalVariableToBeAdded1 = tdElements;
      }else if (thisGlobalName.trim() == globalVarId2) {
        expectedColumnsContainingTheGlobalVariableToBeAdded2 = tdElements;
      }
    }

    var checkbox1 = await expectedColumnsContainingTheGlobalVariableToBeAdded1[2].findElements(By.css("input[type='checkbox']"));
    await checkbox1[0].click();
    var checkbox2 = await expectedColumnsContainingTheGlobalVariableToBeAdded2[2].findElements(By.css("input[type='checkbox']"));
    await checkbox2[0].click();

    var buttonAddGlobal = await driver.findElements(By.css("button[type='submit']"));
    await buttonAddGlobal[0].click();

    //validate that new global variables exist in the result table
    //search the global variable and add
    var rowsAfterCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));

    var global1WasFound = false;
    var global2WasFound = false;
    for (var webElementRow of rowsAfterCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisVarName = await tdElements[1].getText();
      if (thisVarName.trim() == globalVarId1) {
        global1WasFound = true;
      }else if (thisVarName.trim() == globalVarId2) {
        global2WasFound = true;
      }
    }

    expect(true).to.equal(global1WasFound);
    expect(true).to.equal(global2WasFound);

  });



});
