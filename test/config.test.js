var assert = require('assert');
var Config = require('../lib/config');


describe('Config', function () {
  
  var obj = {'OTHER_LDFLAGS': '-framework "Foundation"'}


  it('can be created with obj', function () {
    var config = new Config(obj);

    assert.equal(true, config.equal(obj));
  });

});

