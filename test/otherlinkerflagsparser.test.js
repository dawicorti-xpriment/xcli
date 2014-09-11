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

  it('detects frameworks specified with quotes', function () {
    var flags = '-framework "Foundation"';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': ['Foundation'],
      'weak_frameworks': [],
      'libraries': [],
      'simple': []
    });
  });

  it('detects weak frameworks', function () {
    var flags = '-weak_framework Twitter';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': [],
      'weak_frameworks': ['Twitter'],
      'libraries': [],
      'simple': []
    });
  });

  it('detects libraries', function () {
    var flags = '-l xml2.2.7.3';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': [],
      'weak_frameworks': [],
      'libraries': ['xml2.2.7.3'],
      'simple': []
    });
  });

  it('detects libraries specified without a space', function () {
    var flags = '-lxml2.2.7.3';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': [],
      'weak_frameworks': [],
      'libraries': ['xml2.2.7.3'],
      'simple': []
    });
  });

  it('detects libraries specified with quotes', function () {
    var flags = '-l "Pods-AFNetworking iOS Example-AFNetworking"';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': [],
      'weak_frameworks': [],
      'libraries': ['Pods-AFNetworking iOS Example-AFNetworking'],
      'simple': []
    });
  });

  it('detects libraries specified with quotes without a space', function () {
    var flags = '-l"Pods-AFNetworking iOS Example-AFNetworking"';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': [],
      'weak_frameworks': [],
      'libraries': ['Pods-AFNetworking iOS Example-AFNetworking'],
      'simple': []
    });
  });

  it('detects non categorized other linker flags', function () {
    var flags = '-ObjC -fobjc-arc';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': [],
      'weak_frameworks': [],
      'libraries': [],
      'simple': ['-ObjC', '-fobjc-arc']
    });
  });

  it('strips unnecessary whitespace', function () {
    var flags = '  -ObjC  ';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': [],
      'weak_frameworks': [],
      'libraries': [],
      'simple': ['-ObjC']
    });
  });

  it('doesn\'t recognize as library flags including but not starting with the `-l` string', function () {
    var flags = '-finalize -prefinalized-library';

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': [],
      'weak_frameworks': [],
      'libraries': [],
      'simple': ['-finalize', '-prefinalized-library']
    });
  });

  it('handles flags containing multiple tokens', function () {
    var flags = [
      '-framework Foundation',
      '-weak_framework Twitter',
      '-l xml2.2.7.3',
      '-lxml2.2.7.3',
      '-l "Pods-AFNetworking iOS Example-AFNetworking"',
      '-l"Pods-AFNetworking iOS Example-AFNetworking"',
      '-ObjC -fobjc-arc',
      '-finalize -prefinalized-library'
    ].join(' ');

    assert.deepEqual(otherLinkerFlagsParser.parse(flags), {
      'frameworks': ['Foundation'],
      'weak_frameworks': ['Twitter'],
      'libraries': ['xml2.2.7.3', 'xml2.2.7.3', 'Pods-AFNetworking iOS Example-AFNetworking', 'Pods-AFNetworking iOS Example-AFNetworking'],
      'simple': ['-ObjC', '-fobjc-arc', '-finalize', '-prefinalized-library']
    });
  });

});

