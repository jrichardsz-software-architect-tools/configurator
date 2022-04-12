var chai = require('chai');
var Settings = require('./Settings.js');
var expect = chai.expect;
var assert = chai.assert;
var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var driverPath = require('chromedriver').path;
var By = webdriver.By;
var Key = webdriver.Key;
var until = webdriver.until;

var service = new chrome.ServiceBuilder(driverPath).build();
chrome.setDefaultService(service);
var driver;

describe('Login', function() {

  before(async function() {
    driver = await new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      .build();
    driver.manage().window().maximize()
  });

  after(async function() {
    await driver.quit();
  });

  it('should show error message on empty credentials', async function() {
    await driver.get(Settings.getConfiguratorUrl());
    await driver.wait(
      until.elementsLocated(By.name('user'))
    );
    const button = await driver.wait(
      until.elementsLocated(By.css('.btn.btn-primary.btn-block'))
    );

    await button[0].click();

    await driver.wait(
      until.elementsLocated(By.css('.alert.alert-danger'))
    );
  });


  it('should show error message on bad credentials', async function() {
    await driver.get(Settings.getConfiguratorUrl());
    await driver.wait(
      until.elementsLocated(By.name('user'))
    );
    var usernameBox = await driver.findElement(By.name('user'));
    await usernameBox.sendKeys("jane");
    var passwordBox = await driver.findElement(By.name('password'));
    await passwordBox.sendKeys("secret");

    const button = await driver.wait(
      until.elementsLocated(By.css('.btn.btn-primary.btn-block'))
    );

    await button[0].click();

    await driver.wait(
      until.elementsLocated(By.css('.alert.alert-danger'))
    );
  });

  it('should work if credentials are valid', async function() {
    await driver.get(Settings.getConfiguratorUrl());
    var usernameBox = await driver.findElement(webdriver.By.name('user'));
    await usernameBox.sendKeys(Settings.getConfiguratorAdminUser());
    var passwordBox = await driver.findElement(webdriver.By.name('password'));
    await passwordBox.sendKeys(Settings.getConfiguratorAdminPassword());
    const button = await driver.wait(
      until.elementsLocated(By.css(".btn.btn-primary.btn-block"))
    );
    await button[0].click();
    await driver.wait(
      until.elementsLocated(By.css(".page-header"))
    );
  });

});
