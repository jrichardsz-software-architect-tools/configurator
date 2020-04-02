const bcrypt = require('bcrypt');

function LoginRouter(expressInstance) {

  var _this = this;
  var exceptions = null;

  expressInstance.get('/login', (req, res) => {

    // no login in session
    if (!req.session.loginInformation || req.session.loginInformation.user == "") {
      res.render('login.hbs', {});
      return;
    }

    // valid login in session
    res.redirect('/');

  });

  expressInstance.get('/logout/action', (req, res) => {
    req.session.destroy(function(err) {
      if (err) {
        return logger.info(err);
      }
      res.redirect('/login');
    });
  });

  expressInstance.post('/login/action', (req, res) => {
    logger.info("Login validation for user:"+req.body.user);

    authenticationRepository.findOneByUser(req.body.user.toLowerCase(), function(err, userInformation) {

      if (err) {
        logger.info(err);
        res.render('login.hbs', {
          error_message: "Incorrect user or password."
        });
      }

      bcrypt.compare(req.body.password, userInformation.password, function(compareErr, compareResult) {

        if (compareErr) {
          logger.info(compareErr);
          res.render('login.hbs', {
            error_message: "Internal error."
          });
        }

        if (compareResult) {
          req.session.loginInformation = {
            "user": userInformation.user,
            "role": userInformation.role
          };
          req.session.save();
          res.redirect('/');
        } else {
          logger.info("Password incorrect for user:" + req.body.user);
          res.render('login.hbs', {
            error_message: "Incorrect user or password."
          });
        }
      });

      // if (userInformation[0].password == req.body.password) {
      //
      //   req.session.loginInformation = {
      //     "user": userInformation[0].user,
      //     "role": userInformation[0].role
      //   };
      //
      //   req.session.save();
      //
      //   res.redirect('/');
      // } else {
      //   logger.info("Password incorrect for user:" + req.body.user);
      //   res.render('login.hbs', {
      //     error_message: "Incorrect user or password."
      //   });
      // }
    });
  });

}

module.exports = LoginRouter;
