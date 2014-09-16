var util = require('util');
var AbstractObject = require('../object');


var PBXFileReference = module.exports = function () {
    AbstractObject.call(this);
};

util.inherits(PBXFileReference, AbstractObject);
