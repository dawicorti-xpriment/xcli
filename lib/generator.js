'use strict';

/*
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var replacestream = require('replacestream');
var streamify = require('streamify');


var generator = module.exports = {};

/*
 * Read and send stats, continue with readTree if element is directory
 */

generator.readElement = function (abspath, send, done) {
  fs.stat(abspath, function (err, stats) {
    if (err) return done(err);

    if (stats.isFile()) {
      send(abspath, done);
    }

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
 * Generate project from given skeleton
 */

generator.createFromSkeleton = function (skeleton, output, opts, done) {
  var skeletonPath = path.join(__dirname, 'skeleton', skeleton);

  opts = opts || {};

  generator.readTree(skeletonPath, function (filename, next) {
    var outFilename = filename
      .replace(skeletonPath, output)
      .replace('product-name', opts.productName);

    mkdirp(path.dirname(outFilename), function (err) {
      var writeStream = fs.createWriteStream(outFilename);
      var readStream = fs.createReadStream(filename);

      readStream
        .pipe(replacestream('product-name', opts.productName))
        .pipe(replacestream('company-identifier', opts.companyIdentifier))
        .pipe(replacestream('organisation-name', opts.organisationName))
        .pipe(writeStream);
      writeStream.on('close', next);
    });
  }, done);
};
