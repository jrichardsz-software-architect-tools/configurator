var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
const ApplicationVariableService = require('../../../src/service/ApplicationVariableService.js');
var applicationVariableService = new ApplicationVariableService();

describe('service/ApplicationVariableService.js', function() {
  it('getNewVariablesReadyToInsertByScope globals already exist', async function() {

    function VariableRepository() {

      this.findVariablesByNamesAndScope = function(names, scope) {
        return new Promise(function(resolve, reject) {
          resolve([{
              "name": "g1",
              "value": "*****",
              "description": "",
              "type": "S",
              "scope": "G"
            },
            {
              "name": "g2",
              "value": "103",
              "description": "103",
              "type": "P",
              "scope": "G"
            },
            {
              "name": "g3",
              "value": "103",
              "description": "103",
              "type": "P",
              "scope": "G"
            }
          ]);
        })
      }
    }

    global["variableRepository"] = new VariableRepository();

    var readyToInsertGlobals = await applicationVariableService.getNewVariablesReadyToInsertByScope([{
        "name": "g1",
        "value": "*****",
        "description": "",
        "type": "S",
        "scope": "G"
      },
      {
        "name": "g2",
        "value": "103",
        "description": "103",
        "type": "P",
        "scope": "G"
      },
      {
        "name": "g3",
        "value": "103",
        "description": "103",
        "type": "P",
        "scope": "G"
      }
    ], "G");
    expect(readyToInsertGlobals.length).to.equal(0);
  });
  it('getNewVariablesReadyToInsertByScope new globals', async function() {

    function VariableRepository() {

      this.findVariablesByNamesAndScope = function(names, scope) {
        return new Promise(function(resolve, reject) {
          resolve([]);
        })
      }
    }

    global["variableRepository"] = new VariableRepository();

    var readyToInsertGlobals = await applicationVariableService.getNewVariablesReadyToInsertByScope([{
        "name": "g4",
        "value": "*****",
        "description": "",
        "type": "S",
        "scope": "G"
      },
      {
        "name": "g5",
        "value": "103",
        "description": "103",
        "type": "P",
        "scope": "G"
      },
      {
        "name": "g6",
        "value": "103",
        "description": "103",
        "type": "P",
        "scope": "G"
      }
    ], "G");
    expect(readyToInsertGlobals.length).to.equal(3);
  });

  //TODO : test when there are no local nor globals in the incoming array

});
