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

describe('Application Local Variables', function() {

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

  it('app:add-local-var - should work the local plain variable creation and should appear in the result table ', async function() {

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

  it('app:edit-local-var - should work the local plain variable edition, value should be readable and should appear in the result table ', async function() {

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

  it('app:edit-local-var - secret value should be readable in edition mode', async function() {
    //thre prevous test give us a secret variable
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

  it('app:cancel-delete-var - should be returned to the global home page with app selected when cancel button is clicked', async function() {
    //it is expected to have an app with two variables created in the previous tests
    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + process.env.APP_NAME + '"]'))
    await selectedApplicationElement[0].click();

    //at this point, the application was created.
    //I just need to search the row, get the edit button and click on it
    var rowsCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    //iterate rows looking for the second column which contains the app name
    //get the columns of first application
    var tdElements = await rowsCollection[0].findElements(By.xpath('td'));
    var selectedVariableName = await tdElements[1].getText();
    var deleteButton = await tdElements[6].findElements(By.css("a[title='Delete']"));
    await deleteButton[0].click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle).to.equal("delete");

    var deleteWarningMessage = await driver.findElement(By.id("deleteWarningMessage")).getText();
    expect(true).to.equal(deleteWarningMessage.includes(process.env.APP_NAME));
    expect(true).to.equal(deleteWarningMessage.includes(selectedVariableName));

    var cancelButton = await driver.findElements(By.id("cancelDeletionButton"));
    await cancelButton[0].click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectedElementsAfter = await driver.findElements(By.css("select[name='applicationId']"));
    var selectedApplicationElementsAfter = await selectedElementsAfter[0].findElements(By.xpath('//option[@selected]'));
    var selectedApplicationNameText = await selectedApplicationElementsAfter[0].getText();
    expect(selectedApplicationNameText).to.equal(process.env.APP_NAME);

  });

  it('app:cancel-add-local-var - should be returned to the global home page with app selected when cancel button is clicked', async function() {
    //it is expected to have an app with two variables created in the previous tests
    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + process.env.APP_NAME + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('newLocalVariableButton')).click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(process.env.APP_NAME));

    var cancelButton = await driver.findElements(By.id("cancelAddLocalVarButton"));
    await cancelButton[0].click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectedElementsAfter = await driver.findElements(By.css("select[name='applicationId']"));
    var selectedApplicationElementsAfter = await selectedElementsAfter[0].findElements(By.xpath('//option[@selected]'));
    var selectedApplicationNameText = await selectedApplicationElementsAfter[0].getText();
    expect(selectedApplicationNameText).to.equal(process.env.APP_NAME);

  });


});
