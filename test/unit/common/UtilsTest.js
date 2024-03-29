var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var Utils = require('../../../src/common/Utils.js');

describe('common/Utils.js', function() {
  it('getDifferenceBetweenObjectArraysByField equal sets', function() {
    var arrayA = [
      {
        name : "jane",
        latname : "doe"
      },
      {
        name : "kurt",
        latname : "weller"
      }
    ];

    var arrayB = [
      {
        name : "kurt",
        latname : "weller"
      },
      {
        name : "jane",
        latname : "doe"
      }
    ];

    var difference = Utils.getDifferenceBetweenObjectArraysByField(arrayA, arrayB, "name");
    expect(difference.length).to.equal(0);
  });

  it('getDifferenceBetweenObjectArraysByField left difference', function() {
    var arrayA = [
      {
        name : "jane",
        latname : "doe"
      },
      {
        name : "kurt",
        latname : "weller"
      },
      {
        name : "rich",
        latname : "dotcom"
      },
      {
        name : "william",
        latname : "patterson"
      }
    ];

    var arrayB = [
      {
        name : "kurt",
        latname : "weller"
      },
      {
        name : "jane",
        latname : "doe"
      }
    ];

    var difference = Utils.getDifferenceBetweenObjectArraysByField(arrayA, arrayB, "name");
    expect(difference.length).to.equal(2);
  });

  it('getDifferenceBetweenObjectArraysByField rigth difference', function() {

    var arrayA = [
      {
        name : "kurt",
        latname : "weller"
      },
      {
        name : "jane",
        latname : "doe"
      }
    ];
    var arrayB = [
      {
        name : "jane",
        latname : "doe"
      },
      {
        name : "kurt",
        latname : "weller"
      },
      {
        name : "rich",
        latname : "dotcom"
      },
      {
        name : "william",
        latname : "patterson"
      }
    ];

    var difference = Utils.getDifferenceBetweenObjectArraysByField(arrayA, arrayB, "name");
    expect(difference.length).to.equal(2);
  });
  it('arrayObjecsToArrayValuesFilterByField search subset when exist subset', function() {

    var array = [
      {
        name : "jane",
        flag : "a"
      },
      {
        name : "kurt",
        flag : "a"
      },
      {
        name : "rich",
        flag : "b"
      },
      {
        name : "william",
        flag : "a"
      }
    ];

    var newArray = Utils.arrayObjecsToArrayValuesFilterByField(array, "name", "flag", "b");
    expect(newArray.length).to.equal(1);
    expect(newArray[0]).to.equal("rich");
  });
  it('arrayObjecsToArrayValuesFilterByField search subset when dont exist subset', function() {

    var array = [
      {
        name : "jane",
        flag : "a"
      },
      {
        name : "kurt",
        flag : "a"
      },
      {
        name : "rich",
        flag : "a"
      },
      {
        name : "william",
        flag : "a"
      }
    ];

    var newArray = Utils.arrayObjecsToArrayValuesFilterByField(array, "name", "flag", "b");
    expect(newArray.length).to.equal(0);
  });

});
