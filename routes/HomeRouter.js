function HomeRouter(expressInstance) {

  var _this = this;

  expressInstance.get('/', (req, res) => {
    _this.goToHomePage(req, res);
  });

  this.goToHomePage = function(req, res, redirectAttributes) {
    logger.info("Docker is disabled. Applications will be obtained from database");
    applicationRepository.findByDeleted("N", function(err, containers) {

      var renderAttributes = {
        redirect: '/',
        properties: properties,
        array: containers
      };

      Object.assign(renderAttributes, redirectAttributes);
      res.render('index.hbs', renderAttributes);
    });
  }

}

module.exports = HomeRouter;
