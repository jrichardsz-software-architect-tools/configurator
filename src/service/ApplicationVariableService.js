const Utils = require('../common/Utils.js');

function ApplicationVariableService() {

  this.getNewVariablesReadyToInsertByScope = async (incomingVariablesToImport, scope) => {
    //get just the names as array
    var variableNames = Utils.arrayObjecsToArrayValuesWithFilter(incomingVariablesToImport, "name", "scope", scope);
    if(variableNames.length == 0){
      return [];
    }
    //query if names and scope already exist
    var alreadyExistenVariables = await variableRepository.findVariablesByNamesAndScope(variableNames, scope);
    //if I query for 3 variables and the result has 3 matches, it means that all already exist
    if (alreadyExistenVariables.length == variableNames.length) {
      return [];
    }else{
      //I queried if 3 variables exist, and the result is that just 1 exist
      //I need the two variables that not exist. 3-1 = 2 , it is a difference of collections or sets
      var receivedVariables = Utils.arrayFilterByField(incomingVariablesToImport, "scope", scope)
      return Utils.getDifferenceBetweenObjectArraysByField(alreadyExistenVariables, receivedVariables, "name");
    }
  }
}

module.exports = ApplicationVariableService;
