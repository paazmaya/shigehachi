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

import path from 'node:path';
import crypto from 'crypto';

import fs from 'fs-extra';

import createCommands from './lib/create-commands.js';
import allVariationCommands from './lib/all-variation-commands.js';
import ensureDirectory from './lib/ensure-directory.js';
import findFiles from './lib/find-files.js';
import diffImageFilename from './lib/diff-image-filename.js';
import sanitizeOptions from './lib/sanitize-options.js';
import commandExecution from './lib/command-execution.js';

/**
 * Generate MD5 hash of the given input.
 *
 * @param {string} input Something to use for hashing
 * @returns {string} MD5 hash of the input
 */
const createHash = (input) => {
  const hash = crypto.createHash('md5');
  hash.update(input);

  return hash.digest('hex');
};

/**
 * Run all the commands, reduce the results to only metrics, and parse them.
 * Calls "whenDone" with the metrics storage.
 */
const interateCommands = (list, options) => {
  const metrics = list
    .map((item) => {
      const command = 'gm ' + item.join(' ');
      if (options.verbose) {
        console.log('Command: ' + command);
      }

      return commandExecution(item, options);
    })
    .filter((item) => {
      return item !== false;
    })
    .map((item) => {
      return item;
    });

  const results = {};
  metrics.forEach((item) => {
    const key = createHash(item.A);
    results[key] = item;
  });

  if (options.verbose) {
    console.log(`Metrics list is ${metrics.length} items long, while results has ${Object.keys(results).length} items`);
  }

  return results;
};

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
  }

  /**
   * Iterates to the next command, if such exists in the command list
   * @returns {void}
   */
  _nextRun() {
    const results = interateCommands(this.commandList, this.options);
    if (typeof this.options.whenDone === 'function') {
      this.options.whenDone.call(this, results);
    }
  }

  /**
   * Generate the difference images one by one
   * @returns {void}
   */
  exec() {
    // List of image files in "previous directory"
    const foundPrev = findFiles(this.options.previousDir, this.options);

    if (ensureDirectory(this.options.outputDir) && this.options.verbose) {
      console.log('Output directory for differentiation images did not exist, thus creating it');
    }

    foundPrev.forEach((picture) => {

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
        if (this.options.allVariations) {
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

export default Shigehachi;
