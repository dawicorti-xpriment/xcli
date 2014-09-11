'use strict';

/*
 * Module dependencies
 */

var diff = require('objectdiff').diff;
var path = require('path');

/*
 * Config holds the data for a Xcode build settings file (xcconfig) and
 * provides support for serialization.
 *
 */

var Config = module.exports = function (obj) {
  this.obj = obj;
};

Config.prototype.equal = function (obj) {
  return diff(obj, this.obj).changed === 'equal';
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
  var couple = line.split('=', 2).map(function (elem) {
    return elem.strip();
  });

  return couple.length === 2 ? couple : [];
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
