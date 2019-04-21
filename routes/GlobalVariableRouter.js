function GlobalVariableRouter(expressInstance) {

  var _this = this;

  expressInstance.get('/global-variable', (req, res) => {
    _this.goToHomePage(req, res);
  });

  this.goToHomePage = function(req, res, redirectAttributes) {

    variableRepository.findByScopeAndDeleted("G","N", function(err, entities) {

      var renderAttributes = {
        globalVariables: entities
      };

      Object.assign(renderAttributes, redirectAttributes);
      res.render('global-variable/home.hbs', renderAttributes);
    });
  }

  expressInstance.get('/global-variable/view/new', (req, res) => {
    res.render('global-variable/new.hbs', {});
  });

  expressInstance.post('/global-variable/action/save', (req, res) => {

    logger.info("Save global variable:");
    logger.info(req.body);
    req.body.scope = 'G';
    logger.info(req.body);
    variableRepository.save(req.body, function(err, result) {
      if (err) {
        logger.info(err);
        res.render('global-variable/new.hbs', {
          error_message: "An error occurred when trying to save the global variable."
        });
      } else {
        _this.goToHomePage(req, res, {
          redirect: '/global-variable',
          success_message: "The global variable was saved successfully."
        })
      }
    });
  });

  expressInstance.get('/global-variable/view/edit/:id', (req, res) => {

   variableRepository.findOneById(req.params.id,function(err,entity){
     if (err) {
       logger.info(err);
       _this.goToHomePage(req, res, {
         error_message: "An error occurred when trying to get the global variable."
       })
     } else {
       res.render('global-variable/new.hbs', {
         global:entity
       });
     }
   });
  });


}

module.exports = GlobalVariableRouter;
