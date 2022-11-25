const bcrypt = require('bcrypt');
const uuid = require('uuid');

function ApplicationKeyRouter(expressInstance) {
  var _this = this;
  expressInstance.get('/application-key', ["admin"], (req, res) => {
    _this.goToHomePage(req, res)
  })

  expressInstance.get('/application-key/action/reset', ["admin"], (req, res) => {
    _this.resetApikey(req, res)
  })

  expressInstance.get('/application-key/action/copy', ["admin"], (req, res) => {
    _this.goToHomePage(req, res, {
      redirect: '/application-key',
      success_message: `The apikey has been copied successfully.`
    })
  })

  this.goToHomePage = function (req, res, redirectAttributes) {
    applicationApikeyRepository.findAll(function (err, entities) {

      if (err) {
        logger.info(err)
        var renderAttributes = {
          error_message: "An error occurred when trying to list apikey.",
          error_security_message: req.session.error_security_message || undefined
        }
        req.session.error_security_message = undefined;

        res.render('application-key/home.hbs', renderAttributes);
        return;
      }

      let key = entities;

      if (entities.length === 0) {
        bcrypt.hash(global.properties.api.key, 10, function (err, hash) {
          applicationApikeyRepository.save({ apikey: hash }, function (err, result) {
            key = [{
              apikey: global.properties.api.key
            }]
            if (err) {
              logger.error(`Error trying to persist an apikey: ${err.code} ${err.sqlMessage}`);
              if (err.code === 'ER_DUP_ENTRY') {
                return res.render('application-key/home.hbs', {
                  error_message: "A apikey already exists: " + key.apikey
                });
              } else {
                logger.error(err);
                return res.render('application-key/home.hbs', {
                  error_message: "An error occurred while trying to save the apikey."
                });
              }
            } else {
              var renderAttributes = {
                applicationKey: key,
                error_security_message: req.session.error_security_message || undefined,
                userRole: req.session.loginInformation.role || undefined
              }
              logger.info(renderAttributes)
              return res.render('application-key/home.hbs', renderAttributes)
            }
          })
        })
      } else {
        key = [{
          apikey: global.properties.api.key
        }]

        var renderAttributes = {
          applicationKey: key,
          error_security_message: req.session.error_security_message || undefined,
          userRole: req.session.loginInformation.role || undefined
        }

        req.session.error_security_message = undefined;

        Object.assign(renderAttributes, redirectAttributes);

        res.render('application-key/home.hbs', renderAttributes)
      }
    })
  }

  this.resetApikey = function (req, res) {
    applicationApikeyRepository.delete(function (err, result) {
      if (err) {
        logger.info(err)
        var renderAttributes = {
          error_message: "An error occurred when trying to delete apikey.",
          error_security_message: req.session.error_security_message || undefined
        }
        req.session.error_security_message = undefined;

        res.render('application-key/home.hbs', renderAttributes);
        return;
      }

      let apikey = uuid.v4();

      bcrypt.hash(apikey, 10, function (err, hash) {
        let apikeyHash = {
          apikey: hash
        }

        applicationApikeyRepository.save(apikeyHash, function (err, result) {

          if (err) {
            logger.error(`Error trying to persist an apikey: ${err.code} ${err.sqlMessage}`)
            if (err.code === 'ER_DUP_ENTRY') {
              return res.render('application-key/home.hbs', {
                error_message: "A apikey already exists: " + entities.key
              });
            } else {
              logger.error(err);
              return res.render('application-key/home.hbs', {
                error_message: "An error occurred while trying to save the apikey."
              });
            }
          } else {
            global.properties.api.key = apikey;
            _this.goToHomePage(req, res, {
              redirect: '/application-key',
              success_message: `The apikey was reset.`
            })
          }

          if (err) {
            logger.error(err);
            logger.error(apikey + " The apikey cannot be created.");
            return;
          }

        })
      })

    })
  }
}

module.exports = ApplicationKeyRouter