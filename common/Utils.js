function Utils() {

}

Utils.hasProperty = function(obj, key) {
  // Get property array from key string
   var properties = key.split(".");

   // Iterate through properties, returning undefined if object is null or property doesn't exist
   for (var i = 0; i < properties.length; i++) {
     if (!obj || !obj.hasOwnProperty(properties[i])) {
       return;
     }
     obj = obj[properties[i]];
   }

   // Nested property found, so return the value
   return (typeof obj !== "undefined" && obj != null) ;
};

Utils.getIp = function(req) {
  var ip;
  if (req.headers['x-forwarded-for']) {
      ip = req.headers['x-forwarded-for'].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
      ip = req.connection.remoteAddress;
  } else {
      ip = req.ip;
  }
  return ip;
};

Utils.arrayToSimpleRepresentation = function(array, fieldName, charSeparator) {
  var simpleRepresentation = "";
  for(i=0; i<array.length; i++){
    simpleRepresentation += " "+array[i][fieldName]
    if(i < array.length-1){
      simpleRepresentation += charSeparator;
    }
  }
  return simpleRepresentation;
};

Utils.arrayContainsObject = function(searchedValue, attributeName, array) {
  for (var key in array) {
    if (array[key][attributeName] == searchedValue) {
      return true;
    }
  }
  return false;
};

/*
TODO: improve with https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
*/

Utils.getDifferenceBetweenObjectArraysByField = function(arrayA, arrayB, fieldName) {
  var onlyInA = arrayA.filter(comparer(arrayB, fieldName));
  var onlyInB = arrayB.filter(comparer(arrayA, fieldName));
  return onlyInA.concat(onlyInB);
};

Utils.arrayObjecsToArrayValues = function(array, fieldName) {
  var newArray = [];
  array.forEach(function(object) {
    newArray.push(object[fieldName]);
  });
  return newArray;
};

Utils.arrayObjecsToArrayValuesFilterByField = function(array,fieldName, fieldNameToEvaluate, expectedValue) {
  var newArray = [];
  array.forEach(function(object) {
    if(object[fieldNameToEvaluate] == expectedValue){
      newArray.push(object[fieldName]);
    }
  });
  return newArray;
};

Utils.arrayFilterByField = function(array, fieldNameToEvaluate, expectedValue) {
  var newArray = [];
  array.forEach(function(object) {
    if(object[fieldNameToEvaluate] == expectedValue){
      newArray.push(object);
    }
  });
  return newArray;
};

Utils.obfuscateFieldAndTrimInArray = function(array, fieldName, obfuscateValue, maximumLength) {
  var newArray = [];
  array.forEach(function(object) {
    for(key in object){
      if(key == fieldName){
        object[fieldName] = obfuscateValue;
      }else if(object[key].length > maximumLength){
        object[key] = object[key].substring(0, maximumLength-1);
      }
    }
    newArray.push(object);
  });
  return newArray;
};

Utils.arrayObjecsToArrayValuesWithFilter = function(array, fieldName, fieldNameToEvaluate, expectedValue) {
  var newArray = [];
  array.forEach(function(object) {
    if(object[fieldNameToEvaluate] == expectedValue){
      newArray.push(object[fieldName]);
    }
  });
  return newArray;
};

function comparer(otherArray, fieldKey){
  return function(current){
    return otherArray.filter(function(other){
      return other[fieldKey] == current[fieldKey]
    }).length == 0;
  }
}


module.exports = Utils;
