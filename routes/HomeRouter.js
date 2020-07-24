function HomeRouter(expressInstance) {

  var _this = this;

  expressInstance.get('/', ["admin", "reader"], (req, res) => {
    _this.goToHomePage(req, res);
  });

  this.goToHomePage = function(req, res, redirectAttributes) {

    applicationRepository.findByDeleted("N", function(err, applications) {
      
      if (err) {
        logger.info(err);
        var renderAttributes = {
          error_message: "An error occurred when trying to list applications.",
          error_security_message: req.session.error_security_message || undefined
        };        
        req.session.error_security_message = undefined;        
        
        res.render('index.hbs', renderAttributes);
        return;
      }

      var renderAttributes = {
        redirect: '/',
        properties: properties,
        applications: applications,
        error_security_message: req.session.error_security_message || undefined,
        userRole: req.session.loginInformation.role || undefined
      };
      
      req.session.error_security_message = undefined;

      Object.assign(renderAttributes, redirectAttributes);
      res.render('index.hbs', renderAttributes);
    });
  }

}

module.exports = HomeRouter;
