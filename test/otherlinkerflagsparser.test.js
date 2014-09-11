var assert = require('assert');
var otherLinkerFlagsParser = require('../lib/otherlinkerflagsparser');

describe('otherLinkerFlagsParser', function () {
  

  it('detects frameworks', function () {
    var flags = '-framework Foundation';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': ['Foundation'],
      'weak_frameworks': [],
      'libraries': [],
      'simple': []
    });   
  });

});

