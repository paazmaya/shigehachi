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
  allVariationCommands = require('./lib/all-variation-commands'),
  ensureDirectory = require('./lib/ensure-directory'),
  diffImageFilename = require('./lib/diff-image-filename'),
  sanitizeOptions = require('./lib/sanitize-options'),
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
    this.options = sanitizeOptions(options);

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
   * Filter the previous directory for image files
   *
   * @param {object}   options Configuration options
   * @param {boolean}  options.verbose More information to the console
   * @param {string}   options.previousDir Directory which will be searched for image files
   * @returns {Array}
   */
  _readPrevDir(options) {

    try {
      fs.accessSync(options.previousDir);
    }
    catch (error) {
      if (options.verbose) {
        console.error('Previous image directory did not exists');
      }

      return [];
    }

    const list = filterDir(options.previousDir, null, {
      recursive: options.recursive,
      match: options.match
    });

    if (options.verbose) {
      console.log('Total of ' + list.length + ' image files found');
    }

    return list;
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
    if (this.options.verbose) {
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
        console.log('Remaining gmArgs', gmArgs);

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
      if (typeof this.options.whenDone === 'function') {
        this.options.whenDone.call(this, this.results);
      }

      return;
    }

    const command = this.commandList[this.currentIndex++];

    if (this.options.verbose) {
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
    this.capturedPrev = this._readPrevDir(this.options);

    if (ensureDirectory(this.options.outputDir) && this.options.verbose) {
      console.log('Output directory for differentiation images did not exist, thus creating it');
    }

    this.capturedPrev.forEach((picture) => {

      const prevPicture = path.join(this.options.previousDir, picture);
      const currPicture = path.join(this.options.currentDir, picture);

      if (this.options.verbose) {
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
              metric: this.options.metric,
              color: this.options.color,
              style: this.options.style
            }),
            createCommands.composite(diffPicture, prevPicture, currPicture, {
              longDiffName: this.options.longDiffName || this.options.allVariations,
              compose: this.options.compose,
              style: this.options.style
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
