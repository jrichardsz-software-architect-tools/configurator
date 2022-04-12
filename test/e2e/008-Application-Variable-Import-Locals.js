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

describe('Application Variables: Import Locals: '+importDir, function() {

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

    await commonSteps.validateLocalVariableExistence(driver, appName, var1Name, var1Desc, "changeme", "S", "Secret")
    await commonSteps.validateLocalVariableExistence(driver, appName, var2Name, var2Desc, "changeme", "S", "Secret")

  });

  it('file with non-existent local secret & plain variables should be imported correctly', async function() {
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

    await commonSteps.validateLocalVariableExistence(driver, appName, var1Name, var1Desc, "changeme", "S", "Secret")
    await commonSteps.validateLocalVariableExistence(driver, appName, var2Name, var2Desc, var2Value, "P", "Plain")

  });

  it('file with pre-existent local plain variables should import only the new vars', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, var1Name, var1Value, var1Desc, "P", "Plain")

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

    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+1);

    await commonSteps.validateLocalVariableExistence(driver, appName, var1Name, var1Desc, var1Value, "P", "Plain")
    await commonSteps.validateLocalVariableExistence(driver, appName, var2Name, var2Desc, var2Value, "P", "Plain")

  });

  it('file with pre-existent local secret variables should import only the new vars', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, var1Name, var1Value, var1Desc, "S", "Secret")

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

    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+1);

    await commonSteps.validateLocalVariableExistence(driver, appName, var1Name, var1Desc, var1Value, "S", "Secret")
    await commonSteps.validateLocalVariableExistence(driver, appName, var2Name, var2Desc, "changeme", "S", "Secret")

  });

  it('file with pre-existent local plain & secret variables should import only the new vars', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, var1Name, var1Value, var1Desc, "S", "Secret")

    var var2Name = uuidv4();
    var var2Value = uuidv4();
    var var2Desc = uuidv4();
    await commonSteps.addLocalVariableToApp(driver, appName, var2Name, var2Value, var2Desc, "P", "Plain")

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

    var var3Name = uuidv4();
    var var3Value = uuidv4();
    var var3Desc = uuidv4();

    var var4Name = uuidv4();
    var var4Value = uuidv4();
    var var4Desc = uuidv4();

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
            "type": "P",
            "scope": "L"
        },
        {
            "name": var3Name,
            "value": var3Value,
            "description": var3Desc,
            "type": "S",
            "scope": "L"
        },
        {
            "name": var4Name,
            "value": var4Value,
            "description": var4Desc,
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

    await commonSteps.validateLocalVariableExistence(driver, appName, var1Name, var1Desc, var1Value, "S", "Secret")
    await commonSteps.validateLocalVariableExistence(driver, appName, var2Name, var2Desc, var2Value, "P", "Plain")
    await commonSteps.validateLocalVariableExistence(driver, appName, var3Name, var3Desc, "changeme", "S", "Secret")
    await commonSteps.validateLocalVariableExistence(driver, appName, var4Name, var4Desc, var4Value, "P", "Plain")

  });

});
