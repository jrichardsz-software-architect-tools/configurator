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
const os = require('os');
const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;
const { v4: uuidv4 } = require('uuid');

var driver;
var globalHomePageUrl = Settings.getConfiguratorUrl() + "/application-key";

describe('Application Apikey', function () {
  before(async function () {
    driver = global.driver;
  })

  it('apikey:reset - You must change the apikey', async function () {
    await driver.get(globalHomePageUrl);
    let oldApikey = await driver.findElement(By.id('inpApikey'));
    oldApikey = await oldApikey.getAttribute('value')

    await driver.findElement(By.partialLinkText('Reset apikey')).click();

    let newApikey = await driver.findElement(By.id('inpApikey'))
    newApikey = await newApikey.getAttribute('value')

    expect(oldApikey).not.equal(newApikey)
  })
})