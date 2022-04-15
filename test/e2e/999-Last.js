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

describe('Config', function() {

  before(async function() {
    driver = global.driver;
  });

  after(async function() {
    await driver.quit();
  });

  it('quit driver', async function() {
    expect(true).to.equal(true);
  });

});
