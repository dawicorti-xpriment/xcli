var assert = require('assert');
var fs = require('fs');
var generator = require('../lib/generator');
var streamify = require('streamify');
var rimraf = require('rimraf');

describe('generator', function () {

  afterEach(function (done) {
    rimraf(__dirname + '/ios-project', done);
  });

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
    generator.createFromSkeleton('ios-empty', __dirname + '/ios-project', null, function () {
      fs.exists(__dirname + '/ios-project', function (result) {
        assert.equal(true, result);
        done();
      });
    });
  });

  it('should replace folders names', function (done) {
    var project = {productName: 'foobar'}

    generator.createFromSkeleton('ios-empty', __dirname + '/ios-project', project, function () {
      fs.exists(__dirname + '/ios-project/foobar', function (result) {
        assert.equal(true, result);
        done();
      });
    });
  });

});