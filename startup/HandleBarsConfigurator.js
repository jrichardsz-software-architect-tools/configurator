function HandleBarsConfigurator() {

}

HandleBarsConfigurator.configure = function(hbs) {
  //https://stackoverflow.com/a/31632215/3957754
  hbs.registerHelper({
    eq: function(v1, v2, opts) {
      return (v1 === v2) ? opts.fn(this) : opts.inverse(this);
    },
    ne: function(v1, v2, opts) {
      return v1 !== v2;
      return (v1 !== v2) ? opts.fn(this) : opts.inverse(this);
    },
    lt: function(v1, v2, opts) {
      return v1 < v2;
      return (v1 < v2) ? opts.fn(this) : opts.inverse(this);
    },
    gt: function(v1, v2, opts) {
      return v1 > v2;
      return (v1 > v2) ? opts.fn(this) : opts.inverse(this);
    },
    lte: function(v1, v2, opts) {
      return v1 <= v2;
      return (v1 <= v2) ? opts.fn(this) : opts.inverse(this);
    },
    gte: function(v1, v2, opts) {
      return v1 >= v2;
      return (v1 >= v2) ? opts.fn(this) : opts.inverse(this);
    }
  });

  hbs.registerHelper('incremented', function (index) {
      index++;
      return index;
  });

  hbs.registerHelper('uppercaseFirstLetter', function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);;
  });

  hbs.registerHelper('showValueWithSafeWidth', function (string) {
      string = ""+string;
      
      if(typeof string === 'undefined'){
        return string;
      }      
      
      if(string.length < 20){
        return string;
      }else{
        return string.substring(0,19);  
      }          
  });

  hbs.registerHelper('select', function(selected, options) {
      return options.fn(this).replace(
          new RegExp(' value=\"' + selected + '\"'),
          '$& selected="selected"');
  });
  
  hbs.registerHelper('stringEquals', function(arg1, arg2, options) {
      arg1 = ''+arg1;
      arg2 = ''+arg2;
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

};


module.exports = HandleBarsConfigurator;
