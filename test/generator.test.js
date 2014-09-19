var assert = require('assert');
var generator = require('../lib/generator');
var streamify = require('streamify');


describe('generator', function () {

  it('should send file stats when reading top folder', function (done) {
    var dirContent = [];

    generator.readElement(__dirname + '/fixtures', function (filename, next) {
      dirContent.push(filename);
      next();
    }, function () {
      assert.equal(dirContent[0], __dirname + '/fixtures/empty-file');
      done();
    });
  });

  it('should copy tree', function (done) {
    generator.createFromSkeleton('ios-empty', __dirname + '/fixtures2', null, done);
  });

});