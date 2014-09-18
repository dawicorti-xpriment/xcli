var assert = require('assert');
var generator = require('../lib/generator');
var streamify = require('streamify');


describe('generator', function () {
  it('should send file stats', function (done) {
    var fileStats;

    generator.readElement(__dirname + '/fixtures/empty-file', function (err, stats) {
      fileStats = stats;
    }, function () {
      assert.equal(0, fileStats.size);
      assert.equal(true, fileStats.isFile());
      done();
    });
  });

  it('should send file stats when reading top folder', function (done) {
    var dirStats = {};

    generator.readElement(__dirname + '/fixtures', function (err, stats) {
      dirStats[stats.path] = stats;
    }, function () {
      assert.equal(0, dirStats[__dirname + '/fixtures/empty-file'].size);
      assert.equal(true, dirStats[__dirname + '/fixtures/empty-file'].isFile());
      done();
    });
  });

  it('should work as read stream', function (done) {
    var files = [];
    var testStream = streamify();

    testStream.on('pipe', function (source) {
      source.on('data', function (file) {
        files.push(file);
      });
      source.on('end', function () {
        assert.equal(__dirname + '/fixtures/empty-file', files[0]);
        done();
      });
    });

    generator.createReadTreeStream(__dirname + '/fixtures').pipe(testStream);
  });

});