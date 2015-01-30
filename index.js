/**
 * Shigehachi
 *
 * Diff generation for two sets of images
 */

'use strict';

var fs = require('fs'),
  path = require('path'),
  execFile = require('child_process').execFile,
  util = require('util');

/**
 * @param {object} options Configuration options
 */
var Jikishin = function Jikishin(options) {
  options = options || {};

  // Defaults
  this.color = options.color || '#85144b';
  this.metric = options.metric || 'pae';
  this.style = options.style || 'tint';
  this.verbose = typeof options.verbose === 'boolean' ? options.verbose : true;

  // Directories
  this.prevDir = options.prevDir || '';
  this.currDir = options.currDir || '';
  this.diffDir = options.diffDir || '';

  // List of image files in "previous directory"
  this.capturedPrev = [];
  this.readPrevDir(this.prevDir);

  // List of commands as arrays ['binary', array arguments]
  this.commandList = [];

  // Currently iterating index of the commandList
  this.currentIndex = 0;

  // Regular expressions, test at http://regex101.com
  this.regExpResults = /^Image Difference\s+\((\w+)\):[\s|\w|=]+\s+(((\w+):\s+([\d\.\w]*)\s*(\d+\.\d+)?\s+)+)$/gmi;

};

Jikishin.prototype.readPrevDir = function readPrevDir(dir) {
  var dir = fs.readdirSync(dir);
  this.capturedPrev = dir.filter(function (item) {
    return item.match(/\.png$/);
  });
};

Jikishin.prototype.runner = function runner(bin, args) {
  console.log('runner: ' + bin + ' ' + args.join(' '));
  var self = this;
  execFile(bin, args, null, function childCallback (err, stdout, stderr) {
    console.log(err);
    console.log(stdout);
    console.log(stderr);

    //var matches = regExpResults.exec(stdout);
    //console.dir(matches);

    self.nextRun();
  });
};

Jikishin.prototype.nextRun = function nextRun() {
  if (this.currentIndex === this.commandList.length) {
    return;
  }
  var command = this.commandList[this.currentIndex++];
  this.runner(command[0], command[1]);
};

Jikishin.prototype.createCompareCommand = function createCompareCommand(diffPicture, prevPicture, currPicture) {

  var outputFile = diffPicture.replace('.png', '-' +
    this.color.replace('#', '') + '-' + this.metric +
    '-' + this.style + '.png');

  // http://www.graphicsmagick.org/compare.html
  var compareArgs = [
    'compare',
    '-metric',
    this.metric,
    '-highlight-color',
    '"' + this.color + '"',
    '-highlight-style',
    this.style,
    '-file',
    outputFile,
    prevPicture,
    currPicture
  ];
  this.commandList.push(['gm', compareArgs]);
};

Jikishin.prototype.createCompositeCommand = function createCompositeCommand(diffPicture, prevPicture, currPicture) {
  var compositeFile = diffPicture.replace('-difference.png', '-composite.png');

  // http://www.imagemagick.org/script/composite.php
  var compositeArgs = [
    prevPicture,
    currPicture,
    '-compose',
    'difference',
    compositeFile
  ];
  this.commandList.push(['composite', compositeArgs]);
};

Jikishin.prototype.createNegateCommand = function createNegateCommand(diffPicture, prevPicture, currPicture) {
  var negateFile = diffPicture.replace('-difference.png', '-negate.png');

  // http://www.imagemagick.org/script/convert.php
  var convertArgs = [
    '-negate',
    diffPicture,
    negateFile
  ];
  this.commandList.push(['convert', convertArgs]);
};

/**
 * Actual function to create the diff images
 * Originating from 2014-01-31
 * https://github.com/stefanjudis/grunt-photobox/blob/master/tasks/lib/photobox.js#L73
 */
Jikishin.prototype.createDiffImages = function createDiffImages() {

  var self = this;

  this.readPrevDir(this.prevDir);

  this.capturedPrev.forEach(function (picture) {

    var prevPicture = self.prevDir + '/' + picture; // exists
    var currPicture = self.currDir + '/' + picture; // maybe exists
    var diffPicture = self.diffDir + '/' + picture.replace('.png', '-difference.png');

    util.puts('started diff for ' + picture);

    if (fs.existsSync(prevPicture) && fs.existsSync(currPicture)) {
      self.createCompareCommand(diffPicture, prevPicture, currPicture);
      self.createCompositeCommand(diffPicture, prevPicture, currPicture);
      self.createNegateCommand(diffPicture, prevPicture, currPicture);
    }
  });

  // Start running the commands one by one.
  this.nextRun();
};

module.exports = Jikishin;
