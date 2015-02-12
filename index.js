/**
 * Shigehachi
 *
 * Diff generation for two sets of images
 *
 * Copyright (c) Juga Paazmaya
 * Licensed under the MIT license
 */

'use strict';

var fs = require('fs'),
  path = require('path'),
  execFile = require('child_process').execFile;


var regulars = {
  metric: /^Image Difference\s+\((\w+)\):\s*?/gmi,
  normalised: /^\s+(\w+):\s+([\d\.]+)/gm
};

/**
 * @param {object} options Configuration options
 * @returns {void}
 */
var Jikishin = function Jikishin(options) {
  options = options || {};

  // Defaults
  this.color = options.color || '#85144b';
  this.metric = options.metric || 'pae';
  this.style = options.style || 'tint';
  this.verbose = typeof options.verbose === 'boolean' ? options.verbose : true;

  // Directories
  this.prevDir = options.previousDir || 'previous';
  this.currDir = options.currentDir || 'current';
  this.diffDir = options.differenceDir || 'difference';

  // Callback when all commands have been iterated, called with metrics
  this.whenDone = options.whenDone || null;

  // List of image files in "previous directory"
  this.readPrevDir(this.prevDir);

  // List of commands as arrays ['binary', array arguments]
  this.commandList = [];

  // Metrics storage, indexed by the current image path
  this.results = {};

  // Currently iterating index of the commandList
  this.currentIndex = 0;
};

Jikishin.prototype.readPrevDir = function readPrevDir(dirpath) {
  var dir = fs.readdirSync(dirpath);
  this.capturedPrev = dir.filter(function filterDir(item) {
    return item.match(/\.png$/);
  });
};

Jikishin.prototype.runner = function runner(bin, args) {
  console.log('runner: ' + bin + ' ' + args.join(' '));
  var self = this;
  execFile(bin, args, null, function childCallback (err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
    else {

      var currPath = '';

      var metric = regulars.metric.exec(stdout);
      if (metric) {
        var norm = {};
        var normalised;
        while ((normalised = regulars.normalised.exec(stdout)) !== null) {
          if (normalised.index === regulars.normalised.lastIndex) {
            regulars.normalised.lastIndex++;
          }
          norm[normalised[1].toLowerCase()] = normalised[2];
        }
        self.results[currPath] = {
          metric: metric[1],
          normalised: norm
        };
        console.dir(self.results);
      }
    }
    self.nextRun();
  });
};

Jikishin.prototype.nextRun = function nextRun() {
  if (this.currentIndex === this.commandList.length) {
    if (typeof this.whenDone === 'function') {
      this.whenDone.call(this, [this.results]);
    }
    return;
  }
  var command = this.commandList[this.currentIndex++];
  this.runner(command[0], command[1]);
};

/**
 * Creates the initial comparison command with 'gm compare' and adds
 * it to the command list.
 *
 * @param {string} diffPicture Path to the difference image file
 * @param {string} prevPicture Path to the previous image file
 * @param {string} currPicture Path to the current image file
 * @returns {void}
 * @see http://www.graphicsmagick.org/compare.html
 */
Jikishin.prototype.createCompareCommand = function createCompareCommand(diffPicture, prevPicture, currPicture) {
  var compareArgs = [
    'compare',
    '-metric',
    this.metric,
    '-highlight-color',
    '"' + this.color + '"',
    '-highlight-style',
    this.style,
    '-file',
    diffPicture,
    prevPicture,
    currPicture
  ];
  this.commandList.push(['gm', compareArgs]);
};

/**
 * Creates the composite command and adds it to the command list.
 *
 * @param {string} diffPicture Path to the difference image file
 * @param {string} prevPicture Path to the previous image file
 * @param {string} currPicture Path to the current image file
 * @returns {void}
 * @see http://www.imagemagick.org/script/composite.php
 */
Jikishin.prototype.createCompositeCommand = function createCompositeCommand(diffPicture, prevPicture, currPicture) {
  var compositeFile = diffPicture.replace('-difference.png', '-composite.png');

  var compositeArgs = [
    prevPicture,
    currPicture,
    '-compose',
    'difference',
    compositeFile
  ];
  this.commandList.push(['composite', compositeArgs]);
};


/**
 * Creates the negation command and adds it to the command list.
 *
 * @param {string} diffPicture Path to the difference image file
 * @returns {void}
 * @see http://www.imagemagick.org/script/convert.php
 */
Jikishin.prototype.createNegateCommand = function createNegateCommand(diffPicture) {
  var negateFile = diffPicture.replace('-difference.png', '-negate.png');

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
 * @returns {void}
 */
Jikishin.prototype.createDiffImages = function createDiffImages() {

  var self = this;

  this.readPrevDir(this.prevDir);

  this.capturedPrev.forEach(function eachPicture(picture) {

    var prevPicture = self.prevDir + '/' + picture; // exists
    var currPicture = self.currDir + '/' + picture; // maybe exists
    var diffPicture = self.diffDir + '/' + picture.replace('.png', '-difference.png');

    console.log('started diff for ' + picture);

    if (fs.existsSync(prevPicture) && fs.existsSync(currPicture)) {
      self.createCompareCommand(diffPicture, prevPicture, currPicture);
      self.createCompositeCommand(diffPicture, prevPicture, currPicture);
      self.createNegateCommand(diffPicture);
    }
  });

  // Start running the commands one by one.
  this.nextRun();
};

module.exports = Jikishin;
