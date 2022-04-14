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

describe('Application Variables: Import Globals: '+importDir, function() {

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

  it('app:0 , import: 2 unexistent globals-secret - should create 2 globals and add them to the application', async function() {
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
            "scope": "G"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "P",
            "scope": "G"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+2);

    await commonSteps.validateGlobalVariableExistence(driver, var1Name, var1Desc, var1Value, "P", "Plain")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var1Name, "P", "Plain")
    await commonSteps.validateGlobalVariableExistence(driver, var2Name, var2Desc, var2Value, "P", "Plain")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var2Name, "P", "Plain")
  });

  it('app:0 , import: 2 unexistent globals-plain - should create 2 globals and add them to the application', async function() {
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
            "scope": "G"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "S",
            "scope": "G"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+2);

    await commonSteps.validateGlobalVariableExistence(driver, var1Name, var1Desc, "changeme", "S", "Secret")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var1Name, "S", "Secret")
    await commonSteps.validateGlobalVariableExistence(driver, var2Name, var2Desc, "changeme", "S", "Secret")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var2Name, "S", "Secret")

  });

  it('app:0 , import: 1 unexistent global-plain + unexistent 1 global-secret - should create 2 globals and add them to the application', async function() {
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
            "scope": "G"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "P",
            "scope": "G"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+2);

    await commonSteps.validateGlobalVariableExistence(driver, var1Name, var1Desc, "changeme", "S", "Secret")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var1Name, "S", "Secret")
    await commonSteps.validateGlobalVariableExistence(driver, var2Name, var2Desc, var2Value, "P", "Plain")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var2Name, "P", "Plain")

  });

  it('app:0 , import: 1 non-existent plain-global + 1 existent plain-global - should create 1 global and add the 02 var to the application', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();
    await commonSteps.createGlobalVariable(driver, var1Name, var1Value, var1Desc, "P", "Plain")

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    //count vars before the import
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
            "scope": "G"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "P",
            "scope": "G"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    //perform the import
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    //count rows after the import
    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    //expected two new variables
    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+2);
    //globals should exist
    await commonSteps.validateGlobalVariableExistence(driver, var1Name, var1Desc, var1Value, "P", "Plain")
    await commonSteps.validateGlobalVariableExistence(driver, var2Name, var2Desc, var2Value, "P", "Plain")
    //globals should be added to the application
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var1Name, "P", "Plain")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var2Name, "P", "Plain")

  });

  it('app:0 , import: 1 non-existent secret-global + 1 existent secret-global - should create 1 global and add the 2 var to the application', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();
    await commonSteps.createGlobalVariable(driver, var1Name, var1Value, var1Desc, "S", "Secret")

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    //count vars before the import
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
            "scope": "G"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "S",
            "scope": "G"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    //perform the import
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    //count rows after the import
    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    //expected two new variables
    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+2);
    //globals should exist
    await commonSteps.validateGlobalVariableExistence(driver, var1Name, var1Desc, var1Value, "S", "Secret")
    await commonSteps.validateGlobalVariableExistence(driver, var2Name, var2Desc, "changeme", "S", "Secret")
    //globals should be added to the application
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var1Name, "S", "Secret")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var2Name, "S", "Secret")

  });

  it('app:0 , import: 2 non-existent mix-global + 2 existent mix-global - should create 2 globals and add the 4 vars to the application', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();
    await commonSteps.createGlobalVariable(driver, var1Name, var1Value, var1Desc, "P", "Plain")

    var var2Name = uuidv4();
    var var2Value = uuidv4();
    var var2Desc = uuidv4();
    await commonSteps.createGlobalVariable(driver, var2Name, var2Value, var2Desc, "S", "Secret")

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    //count vars before the import
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
            "type": "P",
            "scope": "G"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "S",
            "scope": "G"
        },
        {
            "name": var3Name,
            "value": var3Value,
            "description": var3Desc,
            "type": "P",
            "scope": "G"
        },
        {
            "name": var4Name,
            "value": var4Value,
            "description": var4Desc,
            "type": "S",
            "scope": "G"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    //perform the import
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    //count rows after the import
    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    //expected two new variables
    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+4);
    //globals should exist
    await commonSteps.validateGlobalVariableExistence(driver, var1Name, var1Desc, var1Value, "P", "Plain")
    await commonSteps.validateGlobalVariableExistence(driver, var2Name, var2Desc, var2Value, "S", "Secret")
    await commonSteps.validateGlobalVariableExistence(driver, var3Name, var3Desc, var3Value, "P", "Plain")
    await commonSteps.validateGlobalVariableExistence(driver, var4Name, var4Desc, "changeme", "S", "Secret")
    //globals should be added to the application
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var1Name, "P", "Plain")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var2Name, "S", "Secret")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var3Name, "P", "Plain")
    await commonSteps.validateVariableExistenceOnApplication(driver, appName, var4Name, "S", "Secret")

  });

  it('app:1 plain-global , import: 1 non-existent plain-global + 1 existent plain-global - should create 1 global and add 1 var to the application', async function() {
    var appName = uuidv4();
    var appDesc = uuidv4();
    await commonSteps.createApplicationAndValidate(driver, appName, appDesc)

    var var1Name = uuidv4();
    var var1Value = uuidv4();
    var var1Desc = uuidv4();
    await commonSteps.createGlobalVariable(driver, var1Name, var1Value, var1Desc, "P", "Plain")
    await commonSteps.addGlobalVarToAplicationAndValidate(driver, appName, var1Name);

    await driver.get(applicationVariableHomePageUrl);

    var formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    var selectElements = await driver.findElements(By.css("select[name='applicationId']"))
    var selectedApplicationElement = await selectElements[0].findElements(By.xpath('option[.="' + appName + '"]'))
    await selectedApplicationElement[0].click();

    //count vars before the import
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
            "scope": "G"
        },
        {
            "name": var2Name,
            "value": var2Value,
            "description": var2Desc,
            "type": "P",
            "scope": "G"
        }
    ]

    await fsPromises.writeFile(importFile, JSON.stringify(variablesToImport));
    //perform the import
    await input.sendKeys(importFile);

    formTitle = await driver.findElement(By.css(".page-header")).getText();
    expect(formTitle.trim()).to.equal("Application Variables");

    //count rows after the import
    var rowsAfterImport = await driver.findElements(By.css("[class='table table-bordered table-hover table-striped'] tbody > tr"));
    var rowsCountAfterImport = rowsAfterImport.length;

    //expected two new variables
    expect(rowsCountAfterImport).to.equal(rowsCountBeforeImport+1);
    //globals should exist
    await commonSteps.validateGlobalVariableExistence(driver, var1Name, var1Desc, var1Value, "P", "Plain")
    await commonSteps.validateGlobalVariableExistence(driver, var2Name, var2Desc, var2Value, "P", "Plain")

  });

});
