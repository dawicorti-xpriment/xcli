'use strict';

/*
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var path = require('path');
var streamify = require('streamify');


var generator = module.exports = {};

/*
 * Read and send stats, continue with readTree if element is directory
 */

generator.readElement = function (abspath, send, done) {
  fs.stat(abspath, function (err, stats) {
    if (err) return done(err);

    stats.path = abspath;
    send(null, stats);

    if (stats.isFile()) done();
    if (stats.isDirectory()) generator.readTree(abspath, send, done);
  });
};

/*
 * Read each element of directory
 */

generator.readTree = function (dir, send, done) {
  fs.readdir(dir, function (err, elements) {
    if (err) return done(err);
    
    async.each(elements, function (element, next) {
      generator.readElement(path.join(dir, element), send, next);
    }, done);
  });
};

/*
 * Send stream event for each received stat
 */

generator.createReadTreeStream = function (dir) {
  var readTreeStream = streamify();

  generator.readElement(
    dir,
    function (err, stats) {
      readTreeStream.emit('data', stats);
    },
    function (err) {
      readTreeStream.emit('end');
    }
  );

  return readTreeStream;
};