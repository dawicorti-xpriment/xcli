'use strict';

/*
 * Module dependencies
 */

var _ = require('lodash');
var shellwords = require('shellwords');


/*
 * Parses other linker flags values.
 */

var otherLinkerFlagsParser = module.exports = {};

/*
 * @return [Hash{Symbol, Array[String]}] Splits the given
 *         other linker flags value by type.
 *
 * @param  [String] flags
 *         The other linker flags value.
 *
 */

var parse = function (flags) {
  var result = {
    'frameworks': [],
    'weak_frameworks': [],
    'libraries': [],
    'simple': []
  };
  var key = null;

  split(flags).forEach(function (token) {
    switch(token) {
      case '-framework':
        key = 'frameworks';
        break;
      case '-weak_framework':
        key = 'weak_frameworks';
        break;
      case '-l':
        key = 'libraries';
        break;
      default:
        if (key) {
          result[key].push(token);
          key = null;
        } else {
          result['simple'].push(token);
        }

        break;
    }

  });

  return result;
};

/*
 * @return [Array<String>] Split the given other linker
 *         flags value, taking into account quoting and
 *         the fact that the `-l` flag might omit the
 *         space.
 *
 * @param  [String] flags
 *         The other linker flags value.
 *
 */

var split = function (flags) {
  return _.flatten(shellwords.split(flags.trim()).map(function (string) {
    return string.match(/\A-l.+/) ? ['-l', string.substr(2)] : string;
  }));
};


otherLinkerFlagsParser.parse = parse;
otherLinkerFlagsParser.split = split;
