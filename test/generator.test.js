var assert = require('assert');
var generator = require('../lib/generator');


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
    var nb = 0;

    generator.readElement(__dirname + '/fixtures', function (err, stats) {
      dirStats[stats.path] = stats;
    }, function () {
      assert.equal(0, dirStats[__dirname + '/fixtures/empty-file'].size);
      assert.equal(true, dirStats[__dirname + '/fixtures/empty-file'].isFile());
      done();
    });
  });
});