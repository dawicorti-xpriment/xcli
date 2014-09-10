var diff = require('objectdiff').diff;

var Config = module.exports = function (obj) {
  this.obj = obj;
};

Config.prototype.equal = function (obj) {
  return diff(obj, this.obj).changed === 'equal';
};

