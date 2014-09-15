var caseConverter = require('./caseConverter');


var AbstractObjectAttribute = module.exports = function (type, name, owner) {
  this.type = type;
  this.name = name;
  this.owner = owner;
};

/*
 * @return [String] The name of the attribute in camel case.
 *
 * @example
 *   attribute.new(:simple, :project_root)
 *   attribute.plist_name #=> projectRoot
 *
 */

AbstractObjectAttribute.prototype.plistName = function () {
  return caseConverter.convertToPlist(this.name, 'lower');
};
