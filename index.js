/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * A lot has been inspired by https://github.com/stefanjudis/grunt-photobox/
 *
 * Copyright (c) Juga Paazmaya
 * Licensed under the MIT license
 */

'use strict';

var fs = require('fs-extra'),
  path = require('path'),
  execFile = require('child_process').execFile;

/**
 * @param {object} options Configuration options
 * @returns {void}
 */
var Jikishin = function Jikishin(options) {
  this._readOptions(options);

  // List of commands as arrays ['binary', array arguments]
  this.commandList = [];

  // List of files found from previous image directory
  this.capturedPrev = [];

  // Metrics storage, indexed by the current image path
  this.results = {};

  // Currently iterating index of the commandList
  this.currentIndex = 0;
};

/**
 * Acceptable metric values
 * @var {array}
 * @see http://www.graphicsmagick.org/compare.html
 */
Jikishin.prototype.metricTypes = [
  'mae', // MeanAbsoluteError
  'mse', // MeanSquaredError
  'pae', // PeakAbsoluteError
  'psnr', // PeakSignalToNoiseRatio
  'rmse' // RootMeanSquaredError
];

/**
 * Acceptable style values
 * @var {array}
 * @see http://www.graphicsmagick.org/GraphicsMagick.html#details-highlight-style
 */
Jikishin.prototype.styleTypes = [
  'assign',
  'threshold',
  'tint',
  'xor'
];

/**
 * Read the options and set defaults when not defined
 * @param {object} options Options passed to the constructor
 * @returns {void}
 */
Jikishin.prototype._readOptions = function readOptions(options) {
  options = options || {};

  // Difference calculation algorithm
  this.metric = typeof options.metric === 'string' &&
    this.metricTypes.indexOf(options.metric) !== -1 ? options.metric : 'pae';
  this.style = typeof options.style === 'string' &&
    this.styleTypes.indexOf(options.style) !== -1 ? options.style : 'tint';
  // http://www.graphicsmagick.org/GraphicsMagick.html#details-highlight-color
  this.color = typeof options.color === 'string' ? options.color : '#85144b';

  this.verbose = typeof options.verbose === 'boolean' ? options.verbose : false;
  this.recursive = typeof options.recursive === 'boolean' ? options.recursive : false;

  // Regular expression for matching image files
  this.match = typeof options.match === 'string' ? new RegExp(options.match) : /\.png$/;

  // Directories
  this.prevDir = typeof options.previousDir === 'string' ? options.previousDir : 'previous';
  this.currDir = typeof options.currentDir === 'string' ? options.currentDir : 'current';
  this.diffDir = typeof options.differenceDir === 'string' ? options.differenceDir : 'difference';

  // Callback when all commands have been iterated, called with metrics
  this.whenDone = typeof options.whenDone === 'function' ? options.whenDone : null;
};

/**
 * Find all image files in the given directory path, possible
 * using recursion if options wish so to happen.
 * @param {string} basedir Directory which will be searched for image files
 * @param {string} parent Possible sub directory path under dirpath
 * @returns {array} List of image file paths relative to the initial dirpath
 */
Jikishin.prototype._filterDir = function filterDir(basedir, parent) {
  parent = parent || '';
  var dirpath = path.join(basedir, parent);
  var dir = fs.readdirSync(dirpath);
  var self = this;

  var images = [];

  dir.forEach(function eachDir(item) {
    var filepath = path.join(dirpath, item); // full path
    var itempath = path.join(parent, item); // relative path to basedir
    if (self.recursive) {
      var stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        images = images.concat(filterDir.call(self, basedir, itempath));
      }
    }
    if (item.match(self.match)) {
      images.push(itempath);
    }
  });

  return images;
};

/**
 * Filter the previous directory for image files
 * @param {string} dirpath Directory which will be searched for image files
 * @returns {void}
 */
Jikishin.prototype._readPrevDir = function readPrevDir(dirpath) {
  if (!fs.existsSync(dirpath)) {
    if (this.verbose) {
      console.error('Previous image directory did not exists');
    }
    return;
  }

  this.capturedPrev = this._filterDir(dirpath);

  if (this.verbose) {
    console.log('Total of ' + this.capturedPrev.length + ' image files found');
  }
};

/**
 * Execute a command
 * @param {string} bin Binary that is supposed to be executed
 * @param {array} args List of arguments passed to the binary command
 * @returns {void}
 */
Jikishin.prototype._runner = function runner(bin, args) {
  if (this.verbose) {
    console.log('Command: ' + bin + ' ' + args.join(' '));
  }
  var self = this;
  execFile(bin, args, null, function childCallback(err, stdout) {
    if (err) {
      console.error(err.syscall, err.code);
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

  // Regular expressions for catching numbers from GM output
  var expr = {
    metric: /^Image Difference\s+\((\w+)\):\s*?/gmi,
    normalised: /^\s+(\w+):\s+([\d\.]+)/gm
  };

  var metric = expr.metric.exec(output);
  if (metric) {
    var norm = {};
    var normalised;

    while ((normalised = expr.normalised.exec(output)) !== null) {
      if (normalised.index === expr.normalised.lastIndex) {
        expr.normalised.lastIndex++; // TODO: how to trigger for testing?
      }
      norm[normalised[1].toLowerCase()] = normalised[2];
    }

    // Since all metric methods output a total value, use it for safeguarding
    if (norm.hasOwnProperty('total')) {
      this.results[currFile] = {
        metric: metric[1],
        normalised: norm
      };
    }
  }
};

/**
 * Iterates to the next command, if such exists in the command list
 * @returns {void}
 */
Jikishin.prototype._nextRun = function nextRun() {
  var len = this.commandList.length;

  if (this.currentIndex === len) {
    if (typeof this.whenDone === 'function') {
      this.whenDone.call(this, this.results);
    }
    return;
  }

  var command = this.commandList[this.currentIndex++];

  if (this.verbose) {
    console.log('Current command iteration ' + this.currentIndex + ' of ' + len);
  }

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
 * Generate the difference images one by one
 * @returns {void}
 */
Jikishin.prototype.exec = function exec() {

  var self = this;

  // List of image files in "previous directory"
  this._readPrevDir(this.prevDir);

  if (!fs.existsSync(this.diffDir)) {
    if (this.verbose) {
      console.log('Output directory for differentiation images did not exist, thus creating it');
    }
    fs.mkdirpSync(this.diffDir);
  }

  this.capturedPrev.forEach(function eachPicture(picture) {

    var prevPicture = path.join(self.prevDir, picture);
    var currPicture = path.join(self.currDir, picture);
    var diffPicture = path.join(self.diffDir, picture);

    if (self.verbose) {
      console.log('Started command creation for ' + picture);
    }

    if (fs.existsSync(prevPicture) && fs.existsSync(currPicture)) {
      // Make sure the directory structure is created
      var dirname = path.dirname(diffPicture);
      if (!fs.existsSync(dirname)) {
        fs.mkdirpSync(dirname);
      }

      self._createCompareCommand(diffPicture, prevPicture, currPicture);
      self._createCompositeCommand(diffPicture, prevPicture, currPicture);
      self._createNegateCommand(diffPicture);
    }
  });

  // Start running the commands one by one.
  this._nextRun();
};

module.exports = Jikishin;
