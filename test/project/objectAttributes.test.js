var assert = require('assert');
var AbstractObjectAttribute = require('../../lib/project/objectAttributes');
var PBXFileReference = require('../../lib/project/object/fileReference');
var Project = require('../../lib/project');


describe('AbstractObjectAttribute', function () {

  var _attribute;
  var _project;

  beforeEach(function () {
    _attribute = new AbstractObjectAttribute('simple', 'source_tree', PBXFileReference);
    _project = new Project('/project_dir/Project.xcodeproj');
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
    var file = _project.new(PBXFileReference);

    file.source_tree = 'A_ROOT';
    assert.equal(_attribute.getValue(file), 'A_ROOT');
    done();
  });

  it('sets its value for a given object', function (done) {
    var file = _project.new(PBXFileReference);

    _attribute.setValue(file, 'A_ROOT');
    assert.equal(file.source_tree, 'A_ROOT');
    done();
  });

  it('sets its default value for a given object');
  it('validates a simple value');
  it('validates an xcodeproj object ISA');

  describe('references by keys attributes', function () {
    it('validates the key of an attribute which stores');
    it('validates the ISA of the value');
    it('accepts a value');
  });

});
