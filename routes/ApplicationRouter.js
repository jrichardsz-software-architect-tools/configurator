function ApplicationRouter(expressInstance) {

  expressInstance.get('/application/view/new', (req, res) => {
    res.render('application/new.hbs', {});
  });

  expressInstance.post('/application/action/save', (req, res) => {

    logger.info("Save application:");
    logger.info(req.body);
    applicationRepository.save(req.body, function(err, result) {
      if (err) {
        logger.info(err);
        res.render('application/new.hbs', {
          error_message: "An error occurred when trying to save the application."
        });
      } else {
        homeRouter.goToHomePage(req, res, {
          success_message: "The application was saved successfully."
        })
      }
    });
  });

  expressInstance.get('/application/view/edit/:id', (req, res) => {

   applicationRepository.findOneById(req.params.id,function(err,application){
     if (err) {
       logger.info(err);
       homeRouter.goToHomePage(req, res, {
         error_message: "An error occurred when trying to get the application."
       })
     } else {
       res.render('application/new.hbs', {
         application:application
       });
     }
   });
  });

  expressInstance.get('/application/view/delete/:id', (req, res) => {

    applicationRepository.findOneById(req.params.id,function(err,application){
      if (err) {
        logger.info(err);
        homeRouter.goToHomePage(req, res, {
          error_message: "An error occurred when trying to get the application."
        })
      } else {
        res.render('common/delete.hbs', {
          entityId:application.id,
          warningMessage:"Are you sure you want to delete this application: {0}".format(application.name),
          entityType:"application"
        });
      }
    });
  });

  //@TODO: use delete instead post method
  expressInstance.post('/application/action/delete', (req, res) => {

    logger.info("Delete application:");
    applicationRepository.logicDelete(req.body.id, function(err, result) {
      if (err) {
        logger.info(err);
        res.render('common/delete.hbs', {
          error_message: "An error occurred when trying to delete the application."
        });
      } else {
        homeRouter.goToHomePage(req, res, {
          success_message: "The application was deleted successfully."
        })
      }
    });
  });

}

module.exports = ApplicationRouter;
