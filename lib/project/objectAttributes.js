var _ = require('lodash');
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

/*
 * Convenience method that returns the value of this attribute for a
 *   given object.
 *
 * @param [AbstractObject] object
 *   the object for which the value of this attribute is requested.
 *
 * @return [String, Array, Hash, AbstractObject, ObjectList]
 *   the value.
 *
 */

AbstractObjectAttribute.prototype.getValue = function (object) {
  var accessor = object[this.name];
  
  return _.isFunction(accessor) ? accessor() : accessor;
};

/*
 * Convenience method that sets the value of this attribute for a
 *   given object. It makes sense only for `:simple` or `:to_one`
 *   attributes.
 *
 * @raise It the type of this attribute is `:to_many`.
 *
 * @param [AbstractObject] object
 *   the object for which to set the value.
 *
 * @param [String, Hash, Array, AbstractObject] new_value
 *   the value to set for the attribute.
 *
 * @return [void]
 *
 */

AbstractObjectAttribute.prototype.setValue = function (object, newValue) {
  if (this.type === 'to_many') throw '[Xcodeproj] Set value called for a to-many attribute';

  object[this.name] = newValue;
};