/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * A lot has been inspired by https://github.com/stefanjudis/grunt-photobox/
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  execFile = require('child_process').execFile;

const filterDir = require('./lib/filter-dir'),
  createCommands = require('./lib/create-commands'),
  parseMetrics = require('./lib/parse-metrics');

/**
 * @param {object} options Configuration options
 * @returns {void}
 */
const Jikishin = function Jikishin(options) {
  this._readOptions(options);

  // Array of arrays, gm command arguments
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
 * Acceptable composition values
 * @var {array}
 * @see http://www.graphicsmagick.org/GraphicsMagick.html#details-compose
 */
Jikishin.prototype.composeTypes = [
  'over',
  'in',
  'out',
  'atop',
  'xor',
  'plus',
  'minus',
  'add',
  'subtract',
  'difference',
  'divide',
  'multiply',
  'bumpmap',
  'copy',
  'copyred',
  'copygreen',
  'copyblue',
  'copyopacity',
  'copycyan',
  'copymagenta',
  'copyyellow',
  'copyblack'
];

/**
 * Read the options and set defaults when not defined
 * @param {object} options Options passed to the constructor
 * @returns {void}
 */
Jikishin.prototype._readOptions = function readOptions(options) {
  options = options || {};

  this._readStringOptions(options);

  this.verbose = typeof options.verbose === 'boolean' ? options.verbose : false;
  this.recursive = typeof options.recursive === 'boolean' ? options.recursive : false;

  // Output file name modifier for including used method/type
  this.longDiffName = typeof options.longDiffName === 'boolean' ? options.longDiffName : false;

  // Callback when all commands have been iterated, called with metrics
  this.whenDone = typeof options.whenDone === 'function' ? options.whenDone : null;
};

/**
 * Read the string options and set defaults when not defined
 * @param {object} options Options passed to the constructor
 * @returns {void}
 */
Jikishin.prototype._readStringOptions = function readStringOptions(options) {

  // Difference calculation algorithm
  this.metric = typeof options.metric === 'string' &&
    this.metricTypes.indexOf(options.metric) !== -1 ? options.metric : 'pae';
  this.style = typeof options.style === 'string' &&
    this.styleTypes.indexOf(options.style) !== -1 ? options.style : 'tint';
  // http://www.graphicsmagick.org/GraphicsMagick.html#details-highlight-color
  this.color = typeof options.color === 'string' ? options.color : 'pink';

  this.compose = typeof options.compose === 'string' &&
    this.composeTypes.indexOf(options.compose) !== -1 ? options.compose : 'difference';

  // Regular expression for matching image files
  this.match = typeof options.match === 'string' ? new RegExp(options.match) : /\.png$/;

  // Directories
  this.prevDir = typeof options.previousDir === 'string' ? options.previousDir : 'previous';
  this.currDir = typeof options.currentDir === 'string' ? options.currentDir : 'current';
  this.diffDir = typeof options.outputDir === 'string' ? options.outputDir : 'difference';
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

  this.capturedPrev = filterDir(dirpath, null, {
    recursive: this.recursive,
    match: this.match
  });

  if (this.verbose) {
    console.log('Total of ' + this.capturedPrev.length + ' image files found');
  }
};

/**
 * Execute a command with 'gm'
 * @param {array} gmArgs List of arguments passed to the binary command
 * @returns {void}
 */
Jikishin.prototype._runner = function runner(gmArgs) {
  if (this.verbose) {
    console.log('Command: gm ' + gmArgs.join(' '));
  }
  execFile('gm', gmArgs, null, (error, stdout) => {
    if (error) {
      console.log(error.syscall, error.code);
      console.error(error.syscall, error.code);
    }
    else if (gmArgs[0] === 'compare') {
      const currFile = gmArgs.pop();
      this._successRan(stdout, currFile);
    }
    this._nextRun();
  });
};

/**
 * Called when the given 'gm compare' command has not failed and parses the output
 * @param {string} output Output from a 'gm compare' command
 * @param {string} currFile Path to the current image file
 * @returns {void}
 */
Jikishin.prototype._successRan = function successRan(output, currFile) {

  const metrics = parseMetrics(output);
  if (metrics) {
    this.results[currFile] = metrics;
  }
};

/**
 * Iterates to the next command, if such exists in the command list
 * @returns {void}
 */
Jikishin.prototype._nextRun = function nextRun() {
  const len = this.commandList.length;

  if (this.currentIndex === len) {
    if (typeof this.whenDone === 'function') {
      this.whenDone.call(this, this.results);
    }
    return;
  }

  const command = this.commandList[this.currentIndex++];

  if (this.verbose) {
    console.log('Current command iteration ' + this.currentIndex + ' of ' + len);
  }

  this._runner(command);
};


/**
 * Generate the difference image file path for the given image file.
 * It will parse any filename template and use 'png' as a suffix.
 *
 * @param {string} picture Basename of the image file
 * @returns {string} Full path to the difference image
 */
Jikishin.prototype._diffFilename = function diffFilename(picture) {
  let diffPicture = path.join(this.diffDir, picture);

  // Make sure the diff image is a PNG
  const suffix = '.png';
  if (diffPicture.indexOf(suffix, diffPicture.length - suffix.length) === -1) {
    const last = diffPicture.lastIndexOf('.');
    diffPicture = diffPicture.substr(0, last !== -1 ? last : diffPicture.length) + suffix;
  }

  if (this.longDiffName) {
    diffPicture = diffPicture.replace(/\.png$/, '-' + this.metric + '-' + this.style + '.png');
  }

  return diffPicture;
};

/**
 * Generate the difference images one by one
 * @returns {void}
 */
Jikishin.prototype.exec = function exec() {
  // List of image files in "previous directory"
  this._readPrevDir(this.prevDir);

  if (!fs.existsSync(this.diffDir)) {
    if (this.verbose) {
      console.log('Output directory for differentiation images did not exist, thus creating it');
    }
    fs.mkdirpSync(this.diffDir);
  }

  this.capturedPrev.forEach((picture) => {

    const prevPicture = path.join(this.prevDir, picture);
    const currPicture = path.join(this.currDir, picture);
    const diffPicture = this._diffFilename(picture);

    if (this.verbose) {
      console.log('Started command creation for ' + picture);
    }

    if (fs.existsSync(prevPicture) && fs.existsSync(currPicture)) {
      // Make sure the directory structure is created
      const dirname = path.dirname(diffPicture);
      if (!fs.existsSync(dirname)) {
        fs.mkdirpSync(dirname);
      }
      this.commandList.push(
        createCommands.compare(diffPicture, prevPicture, currPicture, {
          metric: this.metric,
          color: this.color,
          style: this.style
        }),
        createCommands.composite(diffPicture, prevPicture, currPicture, {
          longDiffName: this.longDiffName,
          compose: this.compose,
          style: this.style
        }),
        createCommands.negate(diffPicture)
      );
    }
  });

  // Start running the commands one by one.
  this._nextRun();
};

module.exports = Jikishin;
