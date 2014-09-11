var diff = require('objectdiff').diff;
var path = require('path');


var Config = module.exports = function (obj) {
  this.obj = obj;
};

Config.prototype.equal = function (obj) {
  return diff(obj, this.obj).changed === 'equal';
};

Config.prototype.extractKeyValue = function (line) {
  var couple = line.split('=', 2).map(function (elem) {
    return elem.strip();
  });

  return couple.length === 2 ? couple : [];
};

Config.prototype.normalizedXConfigPath = function (xcpath) {
  if (path.extname(xcpath) === '.xcconfig') {
    return xcpath;
  } else {
    return xcpath + '.xconfig';
  }
};
