function Settings() {

}

Settings.getConfiguratorUrl = function() {
  return process.env["TEST_CONFIGURATOR_URL"];
};

Settings.getConfiguratorAdminUser = function() {
  return process.env["TEST_CONFIGURATOR_ADMIN"];
};

Settings.getConfiguratorAdminPassword = function() {
  return process.env["TEST_CONFIGURATOR_PASSWORD"];
};

Settings.getProperty = function(key) {
  return process.env[key];
};



module.exports = Settings;
