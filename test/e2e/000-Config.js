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

var service = new chrome.ServiceBuilder(driverPath).build();
chrome.setDefaultService(service);
var driver;

var downloadDir = path.join(os.tmpdir(), uuidv4());
global.downloadDir = downloadDir;
var importDir = path.join(os.tmpdir(), uuidv4());
global.importDir = importDir;

describe('Config', function() {

  before(async function() {
    await fsPromises.mkdir(downloadDir);
    await fsPromises.mkdir(importDir);

    driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().setUserPreferences(
        { "download.default_directory": downloadDir }
    ))
    .build();
    driver.manage().window().maximize();
    global.driver = driver;
  });

  it('start driver', async function() {
    expect(true).to.equal(true);
  });

});
