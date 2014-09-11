'use strict';

/*
 * Module dependencies
 */

var _ = require('lodash');
var diff = require('objectdiff').diff;
var path = require('path');
var shellwords = require("shellwords");
var util = require('util');


/*
 * Config holds the data for a Xcode build settings file (xcconfig) and
 * provides support for serialization.
 *
 */

var Config = module.exports = function (obj) {
  this.obj = obj;
  this.attributes = {};
  this.includes = [];
};

Config.prototype.equal = function (obj) {
  return diff(obj, this.obj).changed === 'equal';
};

/*
 * Returns a hash from the string representation of an Xcconfig file.
 *
 * @param  [string] string
 *         The string representation of an xcconfig file.
 *
 * @return [Object] the hash containing the xcconfig data.
 *
 */

var objFromFileContent = function (config, string) {
  var obj = {};

  _.each(string.split('\n'), function (line) {
    var couple;
    var uncommentedLine = stripComment(config, line);
    var include = extractInclude(config, uncommentedLine);

    if (!!include) {
      config.includes.push(include);
    } else {
      _.assign(obj, extractKeyValue(config, uncommentedLine));
    }
  });

  return obj;
};


/*
 * Merges the given attributes hash while ensuring values are not duplicated.
 *
 * @param  [Object] attributes
 *         The attributes hash to merge into @attributes.
 *
 * @return [void]
 *
 */

var mergeAttributes = function (config, attributes) {
  _.assign(config.attributes, attributes, function (v1, v2) {
    var existing;

    v1 = v1.trim();
    v2 = v2.trim();
    existing = shellwords.split(v1);

    return _.contains(existing, v2) ? v1 : util.format('%s %s', v1, v2);
  });
};
/*
 * Strips the comments from a line of an xcconfig string.
 *
 * @param  [string] line
 *         the line to process.
 *
 * @return [string] the uncommented line.
 *
 */

var stripComment = function (config, line) {
  return line.split('//')[0];
};

/*
 * Returns the file included by a line of an xcconfig string if present.
 *
 * @param  [string] line
 *         the line to process.
 *
 * @return [string] the included file.
 * @return [null] if no include was found in the line.
 *
 */

var extractInclude = function (config, line) {
  var regexp = /#include\s*"(.+)"/;
  var match = line.match(regexp)

  return !!match ? match[1] : null;
};

/*
 * Returns the key and the value described by the given line of an xcconfig.
 *
 * @param  [string] line
 *         the line to process.
 *
 * @return [Array] A tuple where the first entry is the key and the second
 *         entry is the value.
 *
 */

var extractKeyValue = function (config, line) {
  var elems = line.split('=', 2).map(function (elem) {
    return elem.trim();
  });

  return elems.length === 2 ? _.zipObject([elems[0]], [elems[1]]) : {};
};

/*
 * Normalizes the given path to an xcconfing file to be used in includes,
 * appending the extension if necessary.
 *
 * @param  [string] path
 *         The path of the file which will be included in the xcconfig.
 *
 * @return [string] The normalized path.
 *
 */

var normalizedXConfigPath = function (config, xcpath) {
  if (path.extname(xcpath) === '.xcconfig') {
    return xcpath;
  } else {
    return xcpath + '.xconfig';
  }
};
