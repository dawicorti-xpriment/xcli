'use strict';

/*
 * Module dependencies
 */

var _ = require('lodash');
var fs = require('fs');
var otherLinkerFlagsParser = require('./otherlinkerflagsparser');
var path = require('path');
var shellwords = require("shellwords");
var util = require('util');


/*
 * Config holds the data for a Xcode build settings file (xcconfig) and
 * provides support for serialization.
 *
 */

var Config = module.exports = function (obj, throwIt) {
  this.obj = obj;
  this.attributes = {};
  this.includes = [];
  this.otherLinkerFlags = {};
  
  _.each(['simple', 'frameworks', 'weak_frameworks', 'libraries'], function (key) {
    this.otherLinkerFlags[key] = [];
  }, this);

  this.merge(extractObj(obj));
};


/* @!group Serialization */
/*-------------------------------------------------------------------------*/

/*
 * Sorts the internal data by setting name and serializes it in the xcconfig
 * format.
 *
 * @example
 *
 *   config = Config.new('PODS_ROOT' => '"$(SRCROOT)/Pods"', 'OTHER_LDFLAGS' => '-lxml2')
 *   config.to_s # => "OTHER_LDFLAGS = -lxml2\nPODS_ROOT = \"$(SRCROOT)/Pods\""
 *
 * @return [String] The serialized internal data.
 *
 */

Config.prototype.toString = function (prefix) {
  var includeLines = this.includes.map(function (path) {
    return util.format('#include "%s"', normalizedXConfigPath(path));
  });

  var settings = _.chain(this.toObj(prefix))
    .pairs()
    .sortBy(function (pair) {
      return pair[0];
    })
    .map(function (pair) {
      return util.format('%s = %s', pair[0], pair[1]);
    })
    .value();

  return includeLines.concat(settings).join('\n');
};


/*
 * The hash representation of the xcconfig. The hash includes the
 * frameworks, the weak frameworks, the libraries and the simple other
 * linker flags in the `Other Linker Flags` (`OTHER_LDFLAGS`).
 *
 * @note   All the values are sorted to have a consistent output in Ruby
 *         1.8.7.
 *
 * @return [Hash] The hash representation
 *
 */

Config.prototype.toObj = function (prefix) {
  var result = {};
  var prefixedResult = {};
  var list = _.clone(this.otherLinkerFlags['simple'].sort());
  var modifiers = {
    'frameworks': '-framework',
    'weak_frameworks': '-weak_framework',
    'libraries': '-l'
  };

  _.each(['libraries', 'frameworks', 'weak_frameworks'], function (key) {
    var modifier = modifiers[key];
    var sorted = this.otherLinkerFlags[key].sort();

    list = list.concat(sorted.map(function (l) {
      return '' + modifier + ' "' + l + '"'; 
    }));
  }, this);

  result = _.cloneDeep(this.attributes);
  if (list.length > 0) result['OTHER_LDFLAGS'] = list.join(' ');

  if (prefix) {
    _.each(result, function (val, key) {
      prefixedResult[prefix + key] = val;
    });

    result = prefixedResult;
  }

  return result;
};

/*
 * @return [Set<String>] The list of the frameworks required by this
 *         settings file.
 */

Config.prototype.frameworks = function () {
  return this.otherLinkerFlags['frameworks']; 
};

/*
 * @return [Set<String>] The list of the *weak* frameworks required by
 *         this settings file.
 *
 */

Config.prototype.weakFrameworks = function () {
  return this.otherLinkerFlags['weak_frameworks']; 
};

/*
 * @return [Set<String>] The list of the libraries required by this
 *         settings file.
 *
 */

Config.prototype.libraries = function () {
  return this.otherLinkerFlags['libraries']; 
};


/* @!group Merging */
/*-------------------------------------------------------------------------*/

/*
 * Merges the given xcconfig representation in the receiver.
 *
 * @example
 *
 *   config = Config.new('PODS_ROOT' => '"$(SRCROOT)/Pods"', 'OTHER_LDFLAGS' => '-lxml2')
 *   config.merge!('OTHER_LDFLAGS' => '-lz', 'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/Headers"')
 *   config.to_hash # => { 'PODS_ROOT' => '"$(SRCROOT)/Pods"', 'OTHER_LDFLAGS' => '-lxml2 -lz', 'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/Headers"' }
 *
 * @note   If a key in the given hash already exists in the internal data
 *         then its value is appended.
 *
 * @param  [Hash, Config] config
 *         The xcconfig representation to merge.
 *
 * @todo   The logic to normalize an hash should be extracted and the
 *         initializer should not call this method.
 *
 * @return [void]
 *
 */

Config.prototype.merge = function (xcconfig) {
  var flags;
  var flagsByKey;

  if (xcconfig instanceof Config) {
    mergeAttributes(this, xcconfig.attributes);
    _.each(this.otherLinkerFlags, function (val, key) {
      _.merge(this.otherLinkerFlags[key], xcconfig.otherLinkerFlags[key]);
    }, this);
  } else {
    mergeAttributes(this, xcconfig);
    flags = this.attributes['OTHER_LDFLAGS'];
    
    delete this.attributes['OTHER_LDFLAGS'];

    if (!!flags) {
      flagsByKey = otherLinkerFlagsParser.parse(flags);

      _.each(this.otherLinkerFlags, function (val, key) {
        this.otherLinkerFlags[key] = _.union(
          this.otherLinkerFlags[key],
          flagsByKey[key]
        );
      }, this);
    }
  }
};


/* ------------------------------------------------------------------------- */

/* @!group Private Helpers */


/*
 * Returns a Object from the given argument reading it from disk if necessary.
 *
 * @param  [string, Object] argument
 *         The source from where the hash should be extracted.
 *
 * @return [Object]
 *
 */

var extractObj = function (argument) {
  if (_.isString(argument)) {
    return objFromFileContent(this, fs.readFileSync(argument, 'utf8'));
  } else {
    return argument;
  }
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
    var uncommentedLine = stripComment(line);
    var include = extractInclude(uncommentedLine);

    if (!!include) {
      config.includes.push(include);
    } else {
      _.assign(obj, extractKeyValue(uncommentedLine));
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
    if (!v1) return v2.trim();
    if (!v2) return v1.trim();

    var existing;

    v1 = v1.trim();
    v2 = v2.trim();
    existing = v1 && shellwords.split(v1);

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

var stripComment = function (line) {
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

var extractInclude = function (line) {
  var regexp = /#include\s*"(.+)"/;
  var match = line.match(regexp);

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

var extractKeyValue = function (line) {
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

var normalizedXConfigPath = function (xcpath) {
  if (path.extname(xcpath) === '.xcconfig') {
    return xcpath;
  } else {
    return xcpath + '.xconfig';
  }
};
