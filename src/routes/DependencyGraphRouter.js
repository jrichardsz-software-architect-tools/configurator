function DependencyGraphRouter(expressInstance) {
  var _this = this;

  expressInstance.get('/dependency-graph', ["admin", "reader"], (req, res) => {
    _this.goToHomePage(req, res)
  })

  this.goToHomePage = function (req, res, redirectAttributes) {
    let renderAttributes = {
      ...redirectAttributes,
      ...{
        javascriptModule: 'dependency-graph'
      }
    }

    res.render('dependency-graph/home.hbs', renderAttributes)
  }

  expressInstance.get('/dependency-graph/view/graph', ["admin", "reader"], async (req, res) => {
    let globalVarName = req.query.global_var_name;

    let redirectAttributes = {
      globalVarName,
      graph: false
    }

    applicationVariableRepository.findApplicationByGlobalVariableName(globalVarName, (err, applications) => {
      if (err) {
        redirectAttributes.error_message = `An error occurred while trying to find the global variable: ${globalVarName}`;
      }

      if (applications.length === 0) {
        redirectAttributes.error_message = `There are no applications registered for the global variable: ${globalVarName}`;
      }

      if (applications.length > 0) {
        redirectAttributes.graph = true;

        let dot = 'digraph {';
        let count = 1;
        let nodeApp = `var [label="${globalVarName}"];`
        let nodeIdentifiers = `${nodeApp}`;
        let nodeRelations = '';

        for (const application of applications) {
          nodeIdentifiers += `\n${count} [label="${application.name} - ${application.type}"];`;
          nodeRelations += `\nvar -> ${count};`
          count++;
        }

        dot += nodeIdentifiers;
        dot += nodeRelations;

        dot += '}';

        redirectAttributes.dot = dot;
      }

      _this.goToHomePage(req, res, redirectAttributes)
    })

  })
}

module.exports = DependencyGraphRouter