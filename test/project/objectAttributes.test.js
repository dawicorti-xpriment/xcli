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

  it('returns its value for a given object', function (done) {
    throw 'not ready';
  });

  it('sets its value for a given object', function (done) {
    throw 'not ready';
  });

  it('sets its default value for a given object', function (done) {
    throw 'not ready';
  });

  it('validates a simple value', function (done) {
    throw 'not ready';
  });

  it('validates an xcodeproj object ISA', function (done) {
    throw 'not ready';
  });

  describe('references by keys attributes', function () {

    it('validates the key of an attribute which stores', function (done) {
      throw 'not ready';
    });

    it('validates the ISA of the value', function (done) {
      throw 'not ready';
    });

    it('accepts a value', function (done) {
      throw 'not ready';
    });

  });

});
