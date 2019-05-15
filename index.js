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
  {
    execFile
  } = require('child_process');

const crypto = require('crypto');

const filterDir = require('./lib/filter-dir'),
  createCommands = require('./lib/create-commands'),
  types = require('./lib/types'),
  allVariationCommands = require('./lib/all-variation-commands'),
  ensureDirectory = require('./lib/ensure-directory'),
  diffImageFilename = require('./lib/diff-image-filename'),
  parseMetrics = require('./lib/parse-metrics');

/**
 * @param {object} options Configuration options
 * @returns {void}
 */
class Shigehachi {

  /**
   * Generate the difference image file path for the given image file.
   * It will parse any filename template and use 'png' as a suffix.
   *
   * @param {string}   picture Basename of the image file
   * @param {object}   options Configuration options
   * @param {boolean}  options.verbose More information to the console
   * @param {string}   options.previousDir Image directory A
   * @param {string}   options.currentDir Image directory A
   * @param {string}   options.outputDir Difference images are generated here
   * @param {string}   options.color   Differences are highlighted with this color
   * @param {string}   options.metric  Metric algorithm used by GraphicsMagick
   * @param {string}   options.style   Style in which the differentiation image is created
   * @param {string}   options.compose Composition type used for creating a composite image
   * @param {boolean}  options.allVariations Shall all the possible metric and compose variations generated. Applies longDiffName
   * @param {RegExp}   options.match Input file matcher
   * @param {boolean}  options.longDiffName Use longer difference image file name
   * @param {boolean}  options.recursive Recursively find images from previousDir
   * @param {Function} options.whenDone Callback function which is called when all comparisons have finished
   * @returns {string} Full path to the difference image
   */
  constructor (options) {
    this.options = options || {};
    this._readStringOptions(this.options);
    this._readOptions(this.options);

    // Array of arrays, gm command arguments
    this.commandList = [];

    // List of files found from previous image directory
    this.capturedPrev = [];

    // Metrics storage, indexed by the current image path
    this.results = {};

    // Currently iterating index of the commandList
    this.currentIndex = 0;
  }

  /**
   * Read the options and set defaults when not defined
   * @param {object} options Options passed to the constructor
   * @returns {void}
   */
  _readOptions(options) {
    this.verbose = typeof options.verbose === 'boolean' ?
      options.verbose :
      false;
    this.recursive = typeof options.recursive === 'boolean' ?
      options.recursive :
      false;
    this.allVariations = typeof options.allVariations === 'boolean' ?
      options.allVariations :
      false;

    // Output file name modifier for including used method/type
    this.longDiffName = typeof options.longDiffName === 'boolean' ?
      options.longDiffName :
      false;

    // Callback when all commands have been iterated, called with metrics
    this.whenDone = typeof options.whenDone === 'function' ?
      options.whenDone :
      null;
  }

  /**
   * Read the string options and set defaults when not defined
   * @param {object} options Options passed to the constructor
   * @returns {void}
   */
  _readStringOptions(options) {

    // Difference calculation algorithm
    this.metric = typeof options.metric === 'string' &&
      types.METRIC.indexOf(options.metric) !== -1 ?
      options.metric :
      'pae';
    this.style = typeof options.style === 'string' &&
      types.STYLE.indexOf(options.style) !== -1 ?
      options.style :
      'tint';
    // http://www.graphicsmagick.org/GraphicsMagick.html#details-highlight-color
    this.color = typeof options.color === 'string' ?
      options.color :
      'pink';

    this.compose = typeof options.compose === 'string' &&
      types.COMPOSE.indexOf(options.compose) !== -1 ?
      options.compose :
      'difference';

    // Regular expression for matching image files
    this.match = typeof options.match === 'string' ?
      new RegExp(options.match, 'u') :
      /\.png$/u;

    // Directories
    this.previousDir = typeof options.previousDir === 'string' ?
      options.previousDir :
      'previous';
    this.currentDir = typeof options.currentDir === 'string' ?
      options.currentDir :
      'current';
    this.outputDir = typeof options.outputDir === 'string' ?
      options.outputDir :
      'difference';
  }

  /**
   * Filter the previous directory for image files
   * @param {string} dirpath Directory which will be searched for image files
   * @returns {void}
   */
  _readPrevDir(dirpath) {

    try {
      fs.accessSync(dirpath);
    }
    catch (error) {
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
  }

  _hash(input) {
    const hash = crypto.createHash('md5');
    hash.update(input);

    return hash.digest('hex');
  }

  /**
   * Execute a command with 'gm'
   * @param {array} gmArgs List of arguments passed to the binary command
   * @returns {void}
   */
  _runner(gmArgs) {
    const command = 'gm ' + gmArgs.join(' ');
    if (this.verbose) {
      console.log('Command: ' + command);
    }
    execFile('gm', gmArgs, null, (error, stdout) => {
      if (error) {
        console.error('Error occurred when running GraphicsMagick command');
        console.error(error);
      }
      else if (gmArgs[0] === 'compare') {
        const currPicture = gmArgs.pop();
        const prevPicture = gmArgs.pop();
        const diffPicture = gmArgs.pop();

        // Identifier for the test case, simply md5 of the GraphicMagick command used
        const key = this._hash(command);

        const metrics = parseMetrics(stdout);
        if (metrics) {
          metrics.A = prevPicture;
          metrics.B = currPicture;
          metrics.diff = diffPicture;
          this.results[key] = metrics;
        }
      }
      this._nextRun();
    });
  }

  /**
   * Iterates to the next command, if such exists in the command list
   * @returns {void}
   */
  _nextRun() {
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
  }

  /**
   * Generate the difference images one by one
   * @returns {void}
   */
  exec() {
    // List of image files in "previous directory"
    this._readPrevDir(this.previousDir);

    if (ensureDirectory(this.outputDir) && this.verbose) {
      console.log('Output directory for differentiation images did not exist, thus creating it');
    }

    this.capturedPrev.forEach((picture) => {

      const prevPicture = path.join(this.previousDir, picture);
      const currPicture = path.join(this.currentDir, picture);

      if (this.verbose) {
        console.log('Started command creation for ' + picture);
      }

      let bothExist = false;

      try {
        fs.accessSync(prevPicture);
        fs.accessSync(currPicture);
        bothExist = true;
      }
      catch (error) {
        console.error(`Missing "${prevPicture}" and/or "${currPicture}"`);
        console.error(error.message);
      }

      if (bothExist) {
        if (this.allVariations) {
          this.commandList.push(...allVariationCommands(picture, prevPicture, currPicture, this.options));
        }
        else {
          const diffPicture = diffImageFilename(picture, this.options);
          ensureDirectory(path.dirname(diffPicture));

          this.commandList.push(
            createCommands.compare(diffPicture, prevPicture, currPicture, {
              metric: this.metric,
              color: this.color,
              style: this.style
            }),
            createCommands.composite(diffPicture, prevPicture, currPicture, {
              longDiffName: this.longDiffName || this.allVariations,
              compose: this.compose,
              style: this.style
            }),
            createCommands.negate(diffPicture)
          );
        }
      }
    });

    // Start running the commands one by one.
    this._nextRun();
  }
}

module.exports = Shigehachi;
