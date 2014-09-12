var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
var tmp = require('temporary');
var Config = require('../lib/config');


describe('Config', function () {
  
  var _obj;
  var _config;
  var _fixturePath;

  function withContext(test) {
    return function (done) {
      _obj = {'OTHER_LDFLAGS': '-framework "Foundation"'}
      _config = new Config(_obj);
      _fixturePath = __dirname + '/fixtures/oneline-key-value.xcconfig';      
      test(done);
    }
  }

  it('can be serialized with #toObj', withContext(function(done) {
    assert.deepEqual(_config.toObj(), _obj);
    done();
  }));

  it('can be created with file path', withContext(function (done) {
    assert.deepEqual(_config.toObj(), new Config(_fixturePath).toObj());
    done();
  }));

  it('does not modifies the hash used for initialization', withContext(function(done) {
    var original = _.cloneDeep(_obj);
    new Config(_obj);
    assert.deepEqual(_obj, original);
    done();
  }));

  it('parses the frameworks and the libraries', withContext(function(done) {
    var obj = {'OTHER_LDFLAGS': '-framework Foundation -weak_framework Twitter -lxml2.2.7.3' };
    var config = new Config(obj);

    assert.deepEqual(config.frameworks(), ['Foundation']);
    assert.deepEqual(config.weakFrameworks(), ['Twitter']);
    assert.deepEqual(config.libraries(), ['xml2.2.7.3']);
    done();
  }));

  it('can be serialized with toString', withContext(function(done) {
    assert.equal(_config.toString(), 'OTHER_LDFLAGS = -framework "Foundation"');
    done();
  }));

  it('sorts the internal data by setting name when serializing with toString', withContext(function (done) {
    var config = new Config({Y: '2', Z: '3', X: '1'});

    assert.equal(config.toString(), 'X = 1\nY = 2\nZ = 3');
    done();
  }));

  it('can prefix values during serialization', withContext(function(done) {
    var prefixHash = {'PODS_PREFIX_OTHER_LDFLAGS': _obj['OTHER_LDFLAGS']};
    assert.deepEqual(_config.toObj('PODS_PREFIX_'), prefixHash);
    done();
  }));

  it('merges another config hash in place', withContext(function(done) {
    _config.merge({'HEADER_SEARCH_PATHS': '/some/path'})
    assert.deepEqual(_config.toObj(), {
      'OTHER_LDFLAGS': '-framework "Foundation"',
      'HEADER_SEARCH_PATHS': '/some/path',
    });
    done();
  }));

  it('appends a value for the same key when merging', withContext(function (done) {
    _config.merge({'OTHER_LDFLAGS': '-l xml2.2.7.3'});
    assert.deepEqual(_config.toObj(), {
      'OTHER_LDFLAGS': '-l "xml2.2.7.3" -framework "Foundation"'
    });
    done();
  }));

  it('generates the config file with refs to all included xcconfigs', function (done) {
    _config.includes = ['Somefile.xcconfig'];
    assert.equal(_config.toString().split("\n")[0], '#include "Somefile.xcconfig"');
    done();
  });

  it('appends the extension to the included files if needed', withContext(function (done) {
    _config.includes = ['Somefile'];
    assert.equal(_config.toString().split("\n")[0], '#include "Somefile.xcconfig"');
    done();
  }));

  it('creates the config file', withContext(function (done) {
    var temporaryDirectory = (new tmp.Dir()).path;

    _config.merge({'HEADER_SEARCH_PATHS': '/some/path'});
    _config.merge({'OTHER_LDFLAGS': '-l xml2.2.7.3'});
    _config.saveAs(temporaryDirectory + '/Pods.xcconfig')
    fs.readFile(temporaryDirectory + '/Pods.xcconfig', 'utf8', function (err, data) {
      if (err) throw err;

      assert.deepEqual(data.split('\n'), [
        'OTHER_LDFLAGS = -l "xml2.2.7.3" -framework "Foundation"',
        'HEADER_SEARCH_PATHS = /some/path',
      ].sort())

      done();
    });
  }));

});

