var _ = require('lodash');
var inflect = require('i')();


var caseConverter = module.exports = {};

var plistCache = {'lower' : {}, 'normal': {}};


/*
 * @return [String] The plist equivalent of the given Ruby name.
 *
 * @param  [Symbol, String] name
 *         The name to convert
 *
 * @param  [Symbol, Nil] type
 *         The type of conversion. Pass `nil` for normal camel case and
 *         `:lower` for camel case starting with a lower case letter.
 *
 * @example
 *   CaseConverter.convert_to_plist(:project_ref) #=> ProjectRef
 *
 */

caseConverter.convertToPlist = function (name, type) {
  type = (type === 'lower') ? type : 'normal';

  if (name === 'remote_global_id_string') {
    return 'remoteGlobalIDString'; 
  } else if (!_.has(plistCache, type) || !_.has(plistCache[type], name)) {
    if (type === 'lower') {
      plistCache[type][name] = inflect.camelize(name, false);
    } else {
      plistCache[type][name] = inflect.camelize(name);
    }

  }

  return plistCache[type][name];
};

/*
 * @return [Symbol] The Ruby equivalent of the given plist name.
 *
 * @param  [String] name
 *         The name to convert
 *
 * @example
 *   CaseConverter.convert_to_ruby('ProjectRef') #=> :project_ref
 *
 */

caseConverter.convertToSnakeCase = function (name) {
  return inflect.underscore(name);
};


caseConverter.plistCache = plistCache;