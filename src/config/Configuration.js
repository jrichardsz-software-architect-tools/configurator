"use strict";
var fs = require('fs');

function Configuration() {

  function parseObjectProperties(obj) {
    var regex = new RegExp("\\$\\{([^}\\s]*)\\}");
    for (var k in obj) {
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        parseObjectProperties(obj[k])
      } else if (obj.hasOwnProperty(k)) {
        var configInitialValue = "" + obj[k];
        var ocurrences = countOcurrences(configInitialValue, regex);
        var matchesCount = 0;
        while (regex.test(configInitialValue) && matchesCount < ocurrences) {
          var startIndex = configInitialValue.indexOf("${") + 2;
          var endIndex = configInitialValue.indexOf("}");
          var environmentKey = configInitialValue.substring(startIndex, endIndex - startIndex + 2);
          var environmentValue = process.env[environmentKey];
          if (typeof environmentValue !== 'undefined') {
            configInitialValue = configInitialValue.replace("${" + environmentKey + "}", environmentValue);
          }
          matchesCount++;
        };
        if (configInitialValue != ("" + obj[k]) && configInitialValue != "") {
          if (configInitialValue == "true" || configInitialValue == "false") {
            var isTrueSet = (configInitialValue === "true");
            obj[k] = isTrueSet;
          } else {
            obj[k] = configInitialValue;
          }
        } else {
          obj[k] = null;
        }
      }
    }
  }

  this.loadJsonFile = function(jsonFileLocation, charset) {
    var rawApplicationJson = fs.readFileSync(jsonFileLocation, charset);
    var jsonObject = JSON.parse(rawApplicationJson);
    parseObjectProperties(jsonObject);
    return jsonObject;
  }

  function countOcurrences(str, regExp) {
    return (str.match(regExp) || []).length;
  }

}

module.exports = Configuration;
