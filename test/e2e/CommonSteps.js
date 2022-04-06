var Settings = require('./Settings.js');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var Key = webdriver.Key;
var until = webdriver.until;

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

}


module.exports = CommonSteps;
