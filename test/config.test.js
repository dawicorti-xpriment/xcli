var _ = require('lodash');
var assert = require('assert');
var Config = require('../lib/config');

describe('Config', function () {
  
  var _obj = {'OTHER_LDFLAGS': '-framework "Foundation"'}
  var _config = new Config(_obj);
  var _fixturePath = __dirname + '/fixtures/oneline-key-value.xcconfig';

  it('can be serialized with #toObj', function () {
    assert.deepEqual(_config.toObj(), _obj);
  });

  it('can be created with file path', function () {
    assert.deepEqual(_config.toObj(), new Config(_fixturePath).toObj());
  });

  it('does not modifies the hash used for initialization', function () {
    var original = _.cloneDeep(_obj);
    new Config(_obj);
    assert.deepEqual(_obj, original);
  });

  it('parses the frameworks and the libraries', function () {
    var obj = {'OTHER_LDFLAGS': '-framework Foundation -weak_framework Twitter -lxml2.2.7.3' };
    var config = new Config(obj);

    assert.deepEqual(config.frameworks(), ['Foundation']);
    assert.deepEqual(config.weakFrameworks(), ['Twitter']);
    assert.deepEqual(config.libraries(), ['xml2.2.7.3']);
  });

  it('can be serialized with toString', function () {
    assert.equal(_config.toString(), 'OTHER_LDFLAGS = -framework "Foundation"');
  });

  it('sorts the internal data by setting name when serializing with toString', function () {
    var config = new Config({Y: '2', Z: '3', X: '1'});

    assert.equal(config.toString(), 'X = 1\nY = 2\nZ = 3');
  });

});

