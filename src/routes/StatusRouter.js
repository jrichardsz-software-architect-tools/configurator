
function HealthRouter(expressInstance) {
  var _this = this;

  expressInstance.get('/health', ["anonymous"], (req, res) => {
    var response= {
      "code": 200,
      "message": "success"
    };
    res.json(response);
  });


}

module.exports = HealthRouter;
