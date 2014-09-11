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
 * @param  [String] string
 *         The string representation of an xcconfig file.
 *
 * @return [Hash] the hash containing the xcconfig data.
 *
 */

Config.prototype.objFromFileContent = function (string) {
  var obj = {};

  _.each(string.split('\n'), function (line) {
    var couple;
    var uncommentedLine = this.stripComment(line);
    var include = this.extractInclude(uncommentedLine);

    if (!!include) {
      this.includes.push(include);
    } else {
      _.assign(obj, this.extractKeyValue(uncommentedLine));
    }
  }, this);

  return obj;
};


/*
 * Merges the given attributes hash while ensuring values are not duplicated.
 *
 * @param  [Hash] attributes
 *         The attributes hash to merge into @attributes.
 *
 * @return [void]
 *
 */

Config.prototype.mergeAttributes = function (attributes) {
  _.assign(this.attributes, attributes, function (v1, v2) {
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
 * @param  [String] line
 *         the line to process.
 *
 * @return [String] the uncommented line.
 *
 */

Config.prototype.stripComment = function (line) {
  return line.split('//')[0];
};

/*
 * Returns the file included by a line of an xcconfig string if present.
 *
 * @param  [String] line
 *         the line to process.
 *
 * @return [String] the included file.
 * @return [Nil] if no include was found in the line.
 *
 */

Config.prototype.extractInclude = function (line) {
  var regexp = /#include\s*"(.+)"/;
  var match = line.match(regexp)

  return !!match ? match[1] : null;
};

/*
 * Returns the key and the value described by the given line of an xcconfig.
 *
 * @param  [String] line
 *         the line to process.
 *
 * @return [Array] A tuple where the first entry is the key and the second
 *         entry is the value.
 *
 */

Config.prototype.extractKeyValue = function (line) {
  var elems = line.split('=', 2).map(function (elem) {
    return elem.trim();
  });

  return elems.length === 2 ? _.zipObject([elems[0]], [elems[1]]) : {};
};

/*
 * Normalizes the given path to an xcconfing file to be used in includes,
 * appending the extension if necessary.
 *
 * @param  [String] path
 *         The path of the file which will be included in the xcconfig.
 *
 * @return [String] The normalized path.
 *
 */

Config.prototype.normalizedXConfigPath = function (xcpath) {
  if (path.extname(xcpath) === '.xcconfig') {
    return xcpath;
  } else {
    return xcpath + '.xconfig';
  }
};
