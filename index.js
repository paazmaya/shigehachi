/**
 * Shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * A lot has been inspired by https://github.com/stefanjudis/grunt-photobox/
 *
 * Copyright (c) Juga Paazmaya
 * Licensed under the MIT license
 */

'use strict';

var fs = require('fs'),
  path = require('path'),
  execFile = require('child_process').execFile;

// Regular expressions for catching numbers from GM output
var regulars = {
  metric: /^Image Difference\s+\((\w+)\):\s*?/gmi,
  normalised: /^\s+(\w+):\s+([\d\.]+)/gm
};

/**
 * @param {object} options Configuration options
 * @returns {void}
 */
var Jikishin = function Jikishin(options) {
  this._readOptions(options);

  // List of commands as arrays ['binary', array arguments]
  this.commandList = [];

  // Metrics storage, indexed by the current image path
  this.results = {};

  // Currently iterating index of the commandList
  this.currentIndex = 0;
};

/**
 * Read the options and set defaults when not defined
 * @param {object} options Options passed to the constructor
 * @returns {void}
 */
Jikishin.prototype._readOptions = function readOptions(options) {
  options = options || {};

  // Difference calculation algorithm
  this.metric = options.metric || 'pae';
  this.style = options.style || 'tint';
  this.color = options.color || '#85144b';

  this.verbose = typeof options.verbose === 'boolean' ? options.verbose : true;
  this.suffixes = typeof options.suffixes === 'string' ? options.suffixes.split(',') : ['png'];

  // Directories
  this.prevDir = options.previousDir || 'previous';
  this.currDir = options.currentDir || 'current';
  this.diffDir = options.differenceDir || 'difference';

  // Callback when all commands have been iterated, called with metrics
  this.whenDone = typeof options.whenDone === 'function' ? options.whenDone : null;
};

/**
 * Filter the previous directory for image files
 * @param {string} dirpath Directory which will be searched for image files
 * @returns {void}
 */
Jikishin.prototype._readPrevDir = function readPrevDir(dirpath) {
  var dir = fs.readdirSync(dirpath);
  var suffix = new RegExp('\.(' + this.suffixes.join('|') + ')$');
  this.capturedPrev = dir.filter(function filterDir(item) {
    return item.match(suffix);
  });
};

/**
 * Execute a command
 * @param {string} bin Binary that is supposed to be executed
 * @param {array} args List of arguments passed to the binary command
 * @returns {void}
 */
Jikishin.prototype._runner = function runner(bin, args) {
  console.log('runner: ' + bin + ' ' + args.join(' '));
  var self = this;
  execFile(bin, args, null, function childCallback (err, stdout) {
    if (err) {
      console.log(err);
    }
    else if (bin === 'gm') {
      var currFile = args[args.length - 1];
      self._successRan(stdout, currFile);
    }
    self._nextRun();
  });
};

/**
 * Called when the given command has not failed and parses the output
 * @param {string} output Output from a GM command
 * @param {string} currFile Path to the current image file
 * @returns {void}
 */
Jikishin.prototype._successRan = function successRan(output, currFile) {

  var self = this;

  var metric = regulars.metric.exec(output);
  if (metric) {
    var norm = {};
    var normalised;

    while ((normalised = regulars.normalised.exec(output)) !== null) {
      if (normalised.index === regulars.normalised.lastIndex) {
        regulars.normalised.lastIndex++;
      }
      norm[normalised[1].toLowerCase()] = normalised[2];
    }

    self.results[currFile] = {
      metric: metric[1],
      normalised: norm
    };
  }
};

/**
 * Iterates to the next command, if such exists in the command list
 * @returns {void}
 */
Jikishin.prototype._nextRun = function nextRun() {
  if (this.currentIndex === this.commandList.length) {
    if (typeof this.whenDone === 'function') {
      this.whenDone.call(this, [this.results]);
    }
    return;
  }
  var command = this.commandList[this.currentIndex++];
  this._runner(command[0], command[1]);
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
Jikishin.prototype._createCompareCommand = function createCompareCommand(diffPicture, prevPicture, currPicture) {
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
Jikishin.prototype._createCompositeCommand = function createCompositeCommand(diffPicture, prevPicture, currPicture) {
  var compositeFile = diffPicture.replace('.png', '-composite.png');

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
Jikishin.prototype._createNegateCommand = function createNegateCommand(diffPicture) {
  var negateFile = diffPicture.replace('.png', '-negate.png');

  var convertArgs = [
    '-negate',
    diffPicture,
    negateFile
  ];
  this.commandList.push(['convert', convertArgs]);
};

/**
 * Actual function to create the diff images
 * @returns {void}
 */
Jikishin.prototype.exec = function createDiffImages() {

  var self = this;

  // List of image files in "previous directory"
  this._readPrevDir(this.prevDir);

  this.capturedPrev.forEach(function eachPicture(picture) {

    var prevPicture = path.join(self.prevDir, picture);
    var currPicture = path.join(self.currDir, picture);
    var diffPicture = path.join(self.diffDir, picture);

    console.log('started diff for ' + picture);

    if (fs.existsSync(prevPicture) && fs.existsSync(currPicture)) {
      self._createCompareCommand(diffPicture, prevPicture, currPicture);
      self._createCompositeCommand(diffPicture, prevPicture, currPicture);
      self._createNegateCommand(diffPicture);
    }
  });

  // Start running the commands one by one.
  this._nextRun();
};

module.exports = Jikishin;
