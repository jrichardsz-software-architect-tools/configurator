var chai = require('chai');
var Settings = require('./Settings.js');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var Key = webdriver.Key;
var until = webdriver.until;
var expect = chai.expect;

var applicationVariableHomePageUrl = Settings.getConfiguratorUrl()+"/application-variable";
var globalHomePageUrl = Settings.getConfiguratorUrl()+"/global-variable";

function CommonSteps() {

  this.login = async function(driver) {
    await driver.get(Settings.getConfiguratorUrl());
    var usernameBox = await driver.findElement(By.name('user'));
    await usernameBox.sendKeys(Settings.getConfiguratorAdminUser());
    var passwordBox = await driver.findElement(By.name('password'));
    await passwordBox.sendKeys(Settings.getConfiguratorAdminPassword());
    const loginButton = await driver.wait(
      until.elementsLocated(By.css(".btn.btn-primary.btn-block"))
    );
    await loginButton[0].click();
    await driver.wait(
      until.elementsLocated(By.css(".page-header"))
    );
    var applicationHomeTitle = await driver.findElement(By.css(".page-header")).getText();
    return applicationHomeTitle;
  }

  // this.createApplication = async function(driver) {
  //   await driver.get(Settings.getConfiguratorUrl());
  //
  //   //get application count from table: table-responsive
  //   var rowsBeforeCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
  //   var rowsBefore = rowsBeforeCollection.length
  //
  //   var buttonNewApp = await driver.findElements(By.css("a[href='/application/view/new']"));
  //   await buttonNewApp[0].click();
  //
  //   var nameBox = await driver.findElement(By.name('name'));
  //   await nameBox.sendKeys(process.env.APP_NAME);
  //
  //   var descriptionBox = await driver.findElement(By.css("input[name='description']"));
  //   await descriptionBox.sendKeys(process.env.APP_DESC);
  //
  //   var buttonCreateApp = await driver.findElements(By.css("button[type='submit']"));
  //   await buttonCreateApp[0].click();
  //
  //   await driver.wait(
  //     until.elementsLocated(By.css(".page-header"))
  //   );
  //
  //   var rowsAfterCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
  //   var rowsAfter = rowsAfterCollection.length
  //
  //   var appNames = [];
  //   for (var webElementRow of rowsAfterCollection) {
  //     var tdElements = await webElementRow.findElements(By.xpath('td'));
  //     appNames.push(await tdElements[1].getText());
  //   }
  //
  //   expect(rowsAfter).to.equal(rowsBefore + 1);
  //   expect(true).to.equal(appNames.includes(process.env.APP_NAME));
  // }

  this.createApplicationAndValidate = async function(driver, name, desc) {
    await driver.get(Settings.getConfiguratorUrl());

    //get application count from table: table-responsive
    var rowsBeforeCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsBefore = rowsBeforeCollection.length

    var buttonNewApp = await driver.findElements(By.css("a[href='/application/view/new']"));
    await buttonNewApp[0].click();

    var nameBox = await driver.findElement(By.name('name'));
    await nameBox.sendKeys(name);

    var descriptionBox = await driver.findElement(By.css("input[name='description']"));
    await descriptionBox.sendKeys(desc);

    var buttonCreateApp = await driver.findElements(By.css("button[type='submit']"));
    await buttonCreateApp[0].click();

    await driver.wait(
      until.elementsLocated(By.css(".page-header"))
    );

    var rowsAfterCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsAfter = rowsAfterCollection.length

    var appNames = [];
    for (var webElementRow of rowsAfterCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      appNames.push(await tdElements[1].getText());
    }

    expect(rowsAfter).to.equal(rowsBefore + 1);
    expect(true).to.equal(appNames.includes(name));
  }

  this.createGlobalVariable = async function(driver, name, value, desc, type, typeDesc) {
    await driver.get(globalHomePageUrl);

    //get application count from table: table-responsive
    var rowsBeforeCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsBefore = rowsBeforeCollection.length

    var buttonNewGlobal = await driver.findElements(By.css("a[href='/global-variable/view/new']"));
    await buttonNewGlobal[0].click();

    var nameBox = await driver.findElement(By.name('name'));
    await nameBox.sendKeys(name);

    var valueBox = await driver.findElement(By.css("textarea[name='value']"));
    await valueBox.sendKeys(value);

    var descriptionBox = await driver.findElement(By.css("input[name='description']"));
    await descriptionBox.sendKeys(desc);

    await driver.findElement(By.css(`select[name='type'] > option[value=${type}]`)).click();

    var buttonCreateGlobal = await driver.findElements(By.css("button[type='submit']"));
    await buttonCreateGlobal[0].click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle).to.equal("Global Variables");

    var success_message = await driver.findElement(By.css(".alert.alert-success")).getText();
    expect(success_message.trim()).to.equal("The global variable was saved successfully.");

    var rowsAfterCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsAfter = rowsAfterCollection.length

    var globalWasFound = false;
    var globalTypeFound;
    var globalValueFound;
    for (var webElementRow of rowsAfterCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var currentGlobalName = await tdElements[1].getText();
      if(currentGlobalName.trim()==name){
        globalWasFound = true;
        globalTypeFound = await tdElements[2].getText();
        globalValueFound = await tdElements[3].getText();
        break;
      }
    }

    expect(rowsAfter).to.equal(rowsBefore + 1);
    expect(true).to.equal(globalWasFound);
    expect(globalTypeFound).to.equal(typeDesc);
    if(type=="S"){
      expect(true).to.equal(globalValueFound.includes("*"));
    }else if(type=="P"){
      expect(false).to.equal(globalValueFound.includes("*"));
    }
  }

  this.createAppAndAddOneVariable = async function(driver, appName, appDesc, localVarName, localVarValue, localVarDesc, localType, localTypeDesc){

    await this.createApplicationAndValidate(driver, appName, appDesc);

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('newLocalVariableButton')).click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(appName));

    var nameBox = await driver.findElement(By.name('name'));
    await nameBox.sendKeys(localVarName);

    var valueBox = await driver.findElement(By.css("textarea[name='value']"));
    await valueBox.sendKeys(localVarValue);

    var descriptionBox = await driver.findElement(By.css("input[name='description']"));
    await descriptionBox.sendKeys(localVarDesc);

    await driver.findElement(By.css(`select[name='type'] > option[value=${localType}]`)).click();

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
      if(currentGlobalName==localVarName){
        localVariableWasFound = true;
        localVariableTypeFound = await tdElements[2].getText();
        localVariableValueFound = await tdElements[3].getText();
        break;
      }
    }

    expect(true).to.equal(localVariableWasFound);
    expect(localVariableTypeFound).to.equal(localTypeDesc);
    if(localType=="P"){
      expect(false).to.equal(localVariableValueFound.includes("*"));
    }else if(localType=="S"){
      expect(true).to.equal(localVariableValueFound.includes("*"));
    }

  }

  this.addLocalVariableToApp = async function(driver, appName, localVarName, localVarValue, localVarDesc, localType, localTypeDesc){

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('newLocalVariableButton')).click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(appName));

    var nameBox = await driver.findElement(By.name('name'));
    await nameBox.sendKeys(localVarName);

    var valueBox = await driver.findElement(By.css("textarea[name='value']"));
    await valueBox.sendKeys(localVarValue);

    var descriptionBox = await driver.findElement(By.css("input[name='description']"));
    await descriptionBox.sendKeys(localVarDesc);

    await driver.findElement(By.css(`select[name='type'] > option[value=${localType}]`)).click();

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
      if(currentGlobalName==localVarName){
        localVariableWasFound = true;
        localVariableTypeFound = await tdElements[2].getText();
        localVariableValueFound = await tdElements[3].getText();
        break;
      }
    }

    expect(true).to.equal(localVariableWasFound);
    expect(localVariableTypeFound).to.equal(localTypeDesc);
    if(localType=="P"){
      expect(false).to.equal(localVariableValueFound.includes("*"));
    }else if(localType=="S"){
      expect(true).to.equal(localVariableValueFound.includes("*"));
    }

  }

  this.addGlobalVarToAplicationAndValidate = async function(driver, appName, globalVarName){

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    await driver.findElement(By.id('addGlobalVariableButton')).click();

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(appName));

    //search the global variable and add
    var rowsCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    //iterate rows looking for the second column which contains the app name
    var expectedColumnsContainingTheGlobalVariableToBeAdded1;
    for (var webElementRow of rowsCollection) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisGlobalName = await tdElements[0].getText();
      if (thisGlobalName.trim() == globalVarName) {
        expectedColumnsContainingTheGlobalVariableToBeAdded1 = tdElements;
        break;
      }
    }

    var checkbox1 = await expectedColumnsContainingTheGlobalVariableToBeAdded1[2].findElements(By.css("input[type='checkbox']"));
    await checkbox1[0].click();

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
      if (thisVarName.trim() == globalVarName) {
        global1WasFound = true;
        break;
      }
    }

    expect(true).to.equal(global1WasFound);
  }

  this.getTableRowCount = async function(driver, tableClass){
    var rowsCollection = await driver.findElements(By.css(`[class='${tableClass}'] tbody > tr`));
    return rowsCollection.length;
  }

  this.validateLocalVariableExistence = async function(driver, appName, variableName, variableDesc, variableValue, variableType, variableTypeDesc){
    await driver.get(applicationVariableHomePageUrl);
    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    var tableElementRows = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));

    //validating variable 1
    var expectedColumnsContainingTheLocalVariable;
    for (var webElementRow of tableElementRows) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisAppName = await tdElements[1].getText();
      if (thisAppName.trim() == variableName) {
        expectedColumnsContainingTheLocalVariable = tdElements;
        break;
      }
    }
    //validate the existence on table
    expect(expectedColumnsContainingTheLocalVariable);

    expect(variableTypeDesc).to.equal(await expectedColumnsContainingTheLocalVariable[2].getText());
    var importedVar1ValueOnTable = await expectedColumnsContainingTheLocalVariable[3].getText();
    if(variableType=="P"){
      expect(false).to.equal(importedVar1ValueOnTable.includes("*"));
    }else if(variableType=="S"){
      expect(true).to.equal(importedVar1ValueOnTable.includes("*"));
    }

    var editButton = await expectedColumnsContainingTheLocalVariable[6].findElements(By.css("a[title='Edit']"));
    await editButton[0].click();
    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(true).to.equal(formTitle.includes(appName));

    var importedVarNameOnEdit = await driver.findElement(By.css("input[name='name']")).getAttribute("value");
    expect(importedVarNameOnEdit).to.equal(variableName);

    var importedVarValueOnEdit = await driver.findElement(By.css("textarea[name='value']")).getText();
    expect(importedVarValueOnEdit).to.equal(variableValue);

    var importedVarDescOnEdit = await driver.findElement(By.css("input[name='description']")).getAttribute("value");
    expect(importedVarDescOnEdit).to.equal(variableDesc);

    var selectUiElements = await driver.findElements(By.css("select[name='type']"));
    var selectedElements = await selectUiElements[0].findElements(By.xpath('//option[@selected]'));
    var selectedTypeText = await selectedElements[0].getText();
    expect(selectedTypeText).to.equal(variableTypeDesc);

  }

  this.validateGlobalVariableExistence = async function(driver, variableName, variableDesc, variableValue, variableType, variableTypeDesc){
    await driver.get(globalHomePageUrl);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Global Variables");

    var tableElementRows = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));

    //validating variable 1
    var expectedColumnsContainingTheGlobalVariable;
    for (var webElementRow of tableElementRows) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisAppName = await tdElements[1].getText();
      if (thisAppName.trim() == variableName) {
        expectedColumnsContainingTheGlobalVariable = tdElements;
        break;
      }
    }
    //validate the existence on table
    expect(expectedColumnsContainingTheGlobalVariable);

    expect(variableTypeDesc).to.equal(await expectedColumnsContainingTheGlobalVariable[2].getText());
    var importedVar1ValueOnTable = await expectedColumnsContainingTheGlobalVariable[3].getText();
    if(variableType=="P"){
      expect(false).to.equal(importedVar1ValueOnTable.includes("*"));
    }else if(variableType=="S"){
      expect(importedVar1ValueOnTable).to.equal("****");
    }

    var editButton = await expectedColumnsContainingTheGlobalVariable[5].findElements(By.css("a[title='Edit']"));
    await editButton[0].click();
    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle).to.equal("editing global variable");

    var importedVarNameOnEdit = await driver.findElement(By.css("input[name='name']")).getAttribute("value");
    expect(importedVarNameOnEdit).to.equal(variableName);

    var importedVarValueOnEdit = await driver.findElement(By.css("textarea[name='value']")).getText();
    expect(importedVarValueOnEdit).to.equal(variableValue);
    // if(variableType=="P"){
    // }else if(variableType=="S"){
    //   expect(importedVarValueOnEdit).to.equal("changeme");
    // }

    var importedVarDescOnEdit = await driver.findElement(By.css("input[name='description']")).getAttribute("value");
    expect(importedVarDescOnEdit).to.equal(variableDesc);

    var selectUiElements = await driver.findElements(By.css("select[name='type']"));
    var selectedElements = await selectUiElements[0].findElements(By.xpath('//option[@selected]'));
    var selectedTypeText = await selectedElements[0].getText();
    expect(selectedTypeText).to.equal(variableTypeDesc);

  }

  this.validateVariableExistenceOnApplication = async function(driver, appName, variableName, variableType, variableTypeDesc){
    await driver.get(applicationVariableHomePageUrl);
    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    var tableElementRows = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));

    //validating variable 1
    var expectedColumnsContainingTheVariable;
    for (var webElementRow of tableElementRows) {
      var tdElements = await webElementRow.findElements(By.xpath('td'));
      var thisAppName = await tdElements[1].getText();
      if (thisAppName.trim() == variableName) {
        expectedColumnsContainingTheVariable = tdElements;
        break;
      }
    }

    //validate the existence on table
    expect(expectedColumnsContainingTheVariable);

    expect(variableTypeDesc).to.equal(await expectedColumnsContainingTheVariable[2].getText());
    var importedVar1ValueOnTable = await expectedColumnsContainingTheVariable[3].getText();
    if(variableType=="P"){
      expect(false).to.equal(importedVar1ValueOnTable.includes("*"));
    }else if(variableType=="S"){
      expect(importedVar1ValueOnTable).to.equal("*****");
    }

  }

}


module.exports = CommonSteps;
