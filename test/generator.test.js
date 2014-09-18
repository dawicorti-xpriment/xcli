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
});