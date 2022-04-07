var chai = require('chai');
var Settings = require('./Settings.js');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var Key = webdriver.Key;
var until = webdriver.until;
var expect = chai.expect;

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

  this.createApplication = async function(driver) {
    await driver.get(Settings.getConfiguratorUrl());

    //get application count from table: table-responsive
    var rowsBeforeCollection = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsBefore = rowsBeforeCollection.length

    var buttonNewApp = await driver.findElements(By.css("a[href='/application/view/new']"));
    await buttonNewApp[0].click();

    var nameBox = await driver.findElement(By.name('name'));
    await nameBox.sendKeys(process.env.APP_NAME);

    var descriptionBox = await driver.findElement(By.css("input[name='description']"));
    await descriptionBox.sendKeys(process.env.APP_DESC);

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
    expect(true).to.equal(appNames.includes(process.env.APP_NAME));
  }

  this.createGlobalVariable = async function(driver, globalHomePageUrl, name, value, desc, type, typeDesc) {
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

}


module.exports = CommonSteps;
