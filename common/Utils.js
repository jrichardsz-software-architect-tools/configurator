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


module.exports = Utils;
