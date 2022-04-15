const { v4: uuidv4 } = require('uuid');
var chai = require('chai');
var path = require('path');
const os = require('os');
const fs = require('fs');
const util = require('util');
const imgGen = require('js-image-generator');
const generateImage = util.promisify(imgGen.generateImage)
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

var importDir = global.importDir;

describe('Application Variables: Import File Validations: '+importDir, function() {

  before(async function() {
    driver = global.driver;
  });

  it('an import of wrong json should show the error and dont add any rows to the table', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    var rowsCountBeforeImport = await commonSteps.getTableRowCount(driver, "table table-bordered table-hover table-striped");

    //input file
    var input = await driver.findElement(By.id('import_file'));
    var importFile = path.join(importDir, uuidv4()+".json");
    await fsPromises.writeFile(importFile, 'bar')
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var error_message = await driver.findElement(By.css(".alert.alert-danger")).getText();
    expect(error_message).to.equal("Not valid json.");

    var rowsCountAfterImport = await commonSteps.getTableRowCount(driver, "table table-bordered table-hover table-striped");
    expect(rowsCountBeforeImport).to.equal(rowsCountAfterImport);

  });

  it('an empty json array should show the error and dont add any rows to the table', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    var rowsCountBeforeImport = await commonSteps.getTableRowCount(driver, "table table-bordered table-hover table-striped");

    //input file
    var input = await driver.findElement(By.id('import_file'));
    var importFile = path.join(importDir, uuidv4()+".json");
    await fsPromises.writeFile(importFile, '[]')
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var error_message = await driver.findElement(By.css(".alert.alert-warning")).getText();
    expect(error_message.trim()).to.equal("json is empty or is not a collection of variables");

    var rowsCountAfterImport = await commonSteps.getTableRowCount(driver, "table table-bordered table-hover table-striped");
    expect(rowsCountBeforeImport).to.equal(rowsCountAfterImport);

  });

  it('should reject and show an error message on files with size more than 0.5m', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    //input file
    var input = await driver.findElement(By.id('import_file'));
    var importFile = path.join(importDir, uuidv4()+".json");
    var imagen = await generateImage(800, 600, 80);
    await fsPromises.writeFile(importFile, imagen.data)
    await input.sendKeys(importFile);

    var message = await driver.findElement(By.xpath("/html/body")).getText();
    expect(message.trim()).to.equal("File size limit has been reached");

  });

  it('should reject and show an error message on files without json content', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    var rowsCountBeforeImport = await commonSteps.getTableRowCount(driver, "table table-bordered table-hover table-striped");

    //input file
    var input = await driver.findElement(By.id('import_file'));
    var importFile = path.join(importDir, uuidv4()+".json");
    var imagen = await generateImage(10, 10, 80);
    await fsPromises.writeFile(importFile, imagen.data)
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");
    var error_message = await driver.findElement(By.css(".alert.alert-danger")).getText();
    expect(error_message).to.equal("Not valid json.");

    var rowsCountAfterImport = await commonSteps.getTableRowCount(driver, "table table-bordered table-hover table-striped");
    expect(rowsCountBeforeImport).to.equal(rowsCountAfterImport);

  });

});
