var assert = require('assert');
var AbstractObjectAttribute = require('../../lib/project/objectAttributes');
var PBXFileReference = require('../../lib/project/object/fileReference');

describe('AbstractObjectAttribute', function () {

  var _attribute;

  beforeEach(function () {
    _attribute = new AbstractObjectAttribute('simple', 'source_tree', PBXFileReference);
  });

  it('returns its type', function (done) {
    assert.equal(_attribute.type, 'simple');
    done();
  });

  it('returns its name', function (done) {
    assert.equal(_attribute.name, 'source_tree');
    done();
  });

  it('returns its owner', function (done) {
    assert.equal(_attribute.owner, PBXFileReference);
    done();
  });

  it('returns its plist name', function (done) {
    assert.equal(_attribute.plistName(), 'sourceTree');
    done();
  });


});
