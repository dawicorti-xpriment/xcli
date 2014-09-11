var assert = require('assert');
var Config = require('../lib/config');

describe('Config', function () {
  
  var _obj = {'OTHER_LDFLAGS': '-framework "Foundation"'}
  var _config = new Config(_obj);


  it('can be serialized with #toObj', function () {
    assert.deepEqual(_config.toObj(), _obj);
  });

});

