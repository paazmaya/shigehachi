/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * A lot has been inspired by https://github.com/stefanjudis/grunt-photobox/
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (http://paazmaya.fi)
 * Licensed under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  execFile = require('child_process').execFile;

/**
 * @param {object} options Configuration options
 * @returns {void}
 */
var Jikishin = function Jikishin(options) {
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
  this.color = typeof options.color === 'string' ? options.color : '#85144b';

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
 * Find all image files in the given directory path, possible
 * using recursion if options wish so to happen.
 * @param {string} basedir Directory which will be searched for image files
 * @param {string} parent Possible sub directory path under dirpath
 * @returns {array} List of image file paths relative to the initial dirpath
 */
Jikishin.prototype._filterDir = function filterDir(basedir, parent) {
  parent = parent || '';
  const dirpath = path.join(basedir, parent);
  const dir = fs.readdirSync(dirpath);

  let images = [];

  dir.forEach((item) => {
    const filepath = path.join(dirpath, item); // full path
    const itempath = path.join(parent, item); // relative path to basedir
    if (this.recursive) {
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        images = images.concat(filterDir.call(this, basedir, itempath));
      }
    }
    if (item.match(this.match)) {
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

  // Regular expressions for catching numbers from GM output
  const expr = {
    metric: /^Image Difference\s+\((\w+)\):\s*?/gmi,
    normalised: /^\s+(\w+):\s+([\d\.]+)/gm
  };

  const metric = expr.metric.exec(output);
  if (metric) {
    const norm = {};
    let normalised;

    while ((normalised = expr.normalised.exec(output)) !== null) {
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

  this._runner(command);
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

  return compareArgs;
};

/**
 * Creates the composite command and adds it to the command list.
 *
 * The order of the images is relevant as the first is the changed,
 * and the second if the original.
 *
 * @param {string} diffPicture Path to the difference image file
 * @param {string} prevPicture Path to the previous image file
 * @param {string} currPicture Path to the current image file
 * @returns {void}
 * @see http://www.graphicsmagick.org/composite.html
 */
Jikishin.prototype._createCompositeCommand = function createCompositeCommand(diffPicture, prevPicture, currPicture) {
  var append = '-composite';
  if (this.longDiffName) {
    append += '-' + this.compose;
  }
  var compositeFile = diffPicture.replace(/\.png$/, append + '.png');

  var compositeArgs = [
    'composite',
    currPicture,
    prevPicture,
    '-compose',
    this.compose,
    compositeFile
  ];

  return compositeArgs;
};


/**
 * Creates the negation command and adds it to the command list.
 *
 * @param {string} diffPicture Path to the difference image file
 * @returns {void}
 * @see http://www.graphicsmagick.org/convert.html
 */
Jikishin.prototype._createNegateCommand = function createNegateCommand(diffPicture) {
  var negateFile = diffPicture.replace(/\.png$/, '-negate.png');

  var convertArgs = [
    'convert',
    '-negate',
    diffPicture,
    negateFile
  ];

  return convertArgs;
};

/**
 * Generate the difference image file path for the given image file.
 * It will parse any filename template and use 'png' as a suffix.
 *
 * @param {string} picture Basename of the image file
 * @returns {string} Full path to the difference image
 */
Jikishin.prototype._diffFilename = function diffFilename(picture) {
  var diffPicture = path.join(this.diffDir, picture);

  // Make sure the diff image is a PNG
  var suffix = '.png';
  if (diffPicture.indexOf(suffix, diffPicture.length - suffix.length) === -1) {
    var last = diffPicture.lastIndexOf('.');
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

    var prevPicture = path.join(this.prevDir, picture);
    var currPicture = path.join(this.currDir, picture);
    var diffPicture = this._diffFilename(picture);

    if (this.verbose) {
      console.log('Started command creation for ' + picture);
    }

    if (fs.existsSync(prevPicture) && fs.existsSync(currPicture)) {
      // Make sure the directory structure is created
      var dirname = path.dirname(diffPicture);
      if (!fs.existsSync(dirname)) {
        fs.mkdirpSync(dirname);
      }
      this.commandList.push(
        this._createCompareCommand(diffPicture, prevPicture, currPicture),
        this._createCompositeCommand(diffPicture, prevPicture, currPicture),
        this._createNegateCommand(diffPicture)
      );
    }
  });

  // Start running the commands one by one.
  this._nextRun();
};

module.exports = Jikishin;
