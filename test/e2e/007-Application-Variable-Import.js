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

var service = new chrome.ServiceBuilder(driverPath).build();
chrome.setDefaultService(service);
var driver;
var globalHomePageUrl = Settings.getConfiguratorUrl()+"/global-variable";
var applicationVariableHomePageUrl = Settings.getConfiguratorUrl()+"/application-variable";

var importDir = path.join(os.tmpdir(), uuidv4());

describe('Application Variables: Import:'+importDir, function() {

  before(async function() {
    await fsPromises.mkdir(importDir);
    driver = await new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      .build();

    driver.manage().window().maximize()
    var applicationHomeTitle = await commonSteps.login(driver);
    expect(applicationHomeTitle).to.equal("Applications");

  });

  after(async function() {
    await driver.quit();
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

    await driver.sleep(1000);
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

  it('file with non-existent local plain variables should import only local variables', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    var rowsBeforeImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountBeforeImport = rowsBeforeImport.length;

    //input file
    var input = await driver.findElement(By.id('import_file'));
    var importFile = path.join(importDir, uuidv4()+".json");

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();

    var var2Name = uuidv4();
    var var2Value = uuidv4();
    var var2Desc = uuidv4();

    var variablesToImport = [
        {
            "name": var1Name,
            "value": var1Value,
            "description": var1Desc,
            "type": "P",
            "scope": "L"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "P",
            "scope": "L"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+2);

    await commonSteps.validateLocalVariableExistence(driver, appName, var1Name, var1Desc, var1Value, "P", "Plain")
    await commonSteps.validateLocalVariableExistence(driver, appName, var2Name, var2Desc, var2Value, "P", "Plain")
  });

  it('file with non-existent local secret variables should import only local variables with changeme value', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    var rowsBeforeImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountBeforeImport = rowsBeforeImport.length;

    //input file
    var input = await driver.findElement(By.id('import_file'));
    var importFile = path.join(importDir, uuidv4()+".json");

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();

    var var2Name = uuidv4();
    var var2Value = uuidv4();
    var var2Desc = uuidv4();

    var variablesToImport = [
        {
            "name": var1Name,
            "value": var1Value,
            "description": var1Desc,
            "type": "S",
            "scope": "L"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "S",
            "scope": "L"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+2);

    await commonSteps.validateLocalVariableExistence(driver, appName, var1Name, var1Desc, var1Value, "S", "Secret")
    await commonSteps.validateLocalVariableExistence(driver, appName, var2Name, var2Desc, var2Value, "S", "Secret")

  });

});
