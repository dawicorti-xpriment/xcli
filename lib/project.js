var _ = require('lodash');
var crypto = require('crypto');
var path = require('path');


var Project = module.exports = function (ppath, skipInitialization) {
  this.path = path.resolve(ppath);
  this.objectsByUUID = {}
  this.generatedUUIDs = []
  this.availableUUIDs = []
  
  /*
   * TO PORT
   *
  unless skip_initialization
    initialize_from_scratch
  end
  unless skip_initialization.is_a?(TrueClass) || skip_initialization.is_a?(FalseClass)
    raise ArgumentError, '[Xcodeproj] Initialization parameter expected to ' \
      "be a boolean #{skip_initialization}"
  end
  */
};


/* @!group Creating objects */
/*-------------------------------------------------------------------------*/

/*
 * Creates a new object with a suitable UUID.
 *
 * The object is only configured with the default values of the `:simple`
 * attributes, for this reason it is better to use the convenience methods
 * offered by the {AbstractObject} subclasses or by this class.
 *
 * @param  [Class, String] klass
 *         The concrete subclass of AbstractObject for new object or its
 *         ISA.
 *
 * @return [AbstractObject] the new object.
 *
 */

Project.prototype.new = function (Klass) {
  var object = new Klass(this, this.generateUUID());
  object.initializeDefaults();

  return object;
};

/*
 * Generates a UUID unique for the project.
 *
 * @note   UUIDs are not guaranteed to be generated unique because we need
 *         to trim the ones generated in the xcodeproj extension.
 *
 * @note   Implementation detail: as objects usually are created serially
 *         this method creates a batch of UUID and stores the not colliding
 *         ones, so the search for collisions with known UUIDS (a
 *         performance bottleneck) is performed less often.
 *
 * @return [String] A UUID unique to the project.
 *
 */

Project.prototype.generateUUID = function () {
  while (this.availableUUIDs.length === 0) this.generateAvailableUUIDList();
  return this.availableUUIDs.shift();
};

/*
 * Pre-generates the given number of UUIDs. Useful for optimizing
 * performance when the rough number of objects that will be created is
 * known in advance.
 *
 * @param  [Integer] count
 *         the number of UUIDs that should be generated.
 *
 * @note   This method might generated a minor number of uniques UUIDs than
 *         the given count, because some might be duplicated a thus will be
 *         discarded.
 *
 * @return [void]
 *
 */

Project.prototype.generateAvailableUUIDList = function (count) {
  count = count || 100;

  var newUUIDs = _.range(0, count).map(function () {
    return crypto.randomBytes(12).toString('hex').toUpperCase()
  });
  var uniques = _.difference(newUUIDs, this.generatedUUIDs, this.availableUUIDs);
  
  this.generatedUUIDs = this.generatedUUIDs.concat(uniques);
  this.availableUUIDs = this.availableUUIDs.concat(uniques);
};
