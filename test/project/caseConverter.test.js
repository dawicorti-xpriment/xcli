var assert = require('assert');
var caseConverter = require('../../lib/project/caseConverter');


describe('caseConverter', function () {

  it('converts a name to the plist format', function (done) {
    var result = caseConverter.convertToPlist('project_ref');
    assert.equal(result, 'ProjectRef');
    done();
  });

  it('converts a name to the plist format starting with a lowercase letter', function (done) {
    var result = caseConverter.convertToPlist('source_tree', 'lower');
    assert.equal(result, 'sourceTree');
    done();
  });

  it('handles remoteGlobalIDString', function (done) {
    var result = caseConverter.convertToPlist('remote_global_id_string', 'lower');
    
    assert.notEqual(result, 'remoteGlobalIdString');
    assert.equal(result, 'remoteGlobalIDString');
    done();
  });

  it('concerts a name to the Ruby symbol', function (done) {
    var result = caseConverter.convertToSnakeCase('ProjectRef')
    assert.equal(result, 'project_ref');
    done();
  });

});