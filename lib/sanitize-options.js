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

/* eslint-disable max-len, max-lines-per-function, complexity, max-statements */



const types = require('./types'),
  defaults = require('./defaults');

/**
 * Read input options and return options object with sanitized values.
 *
 * @param {object}   input Configuration options
 * @param {boolean}  input.verbose More information to the console
 * @param {string}   input.previousDir Image directory A
 * @param {string}   input.currentDir Image directory A
 * @param {string}   input.outputDir Difference images are generated here
 * @param {string}   input.color   Differences are highlighted with this color
 * @param {string}   input.metric  Metric algorithm used by GraphicsMagick
 * @param {string}   input.style   Style in which the differentiation image is created
 * @param {string}   input.compose Composition type used for creating a composite image
 * @param {boolean}  input.allVariations Shall all the possible metric and compose variations generated. Applies longDiffName
 * @param {RegExp}   input.match Input file matcher
 * @param {boolean}  input.longDiffName Use longer difference image file name
 * @param {boolean}  input.recursive Recursively find images from previousDir
 * @param {Function} input.whenDone Callback function which is called when all comparisons have finished
 * @returns {object} Sanitized options with default values where non accepted given
 */
module.exports = (input) => {
  input = input || {}; // fail safe
  const output = {};

  // Difference calculation algorithm
  output.metric = typeof input.metric === 'string' &&
    types.METRIC.indexOf(input.metric) !== -1 ?
    input.metric :
    defaults.METRIC;
  output.style = typeof input.style === 'string' &&
    types.STYLE.indexOf(input.style) !== -1 ?
    input.style :
    defaults.STYLE;
  // http://www.graphicsmagick.org/GraphicsMagick.html#details-highlight-color
  output.color = typeof input.color === 'string' ?
    input.color :
    defaults.COLOR;

  output.compose = typeof input.compose === 'string' &&
    types.COMPOSE.indexOf(input.compose) !== -1 ?
    input.compose :
    defaults.COMPOSE;

  // Regular expression for matching image files
  output.match = typeof input.match === 'string' ?
    new RegExp(input.match, 'u') :
    defaults.MATCH_PNG;

  // Directories
  output.previousDir = typeof input.previousDir === 'string' ?
    input.previousDir :
    defaults.PREVIOUS_DIR;
  output.currentDir = typeof input.currentDir === 'string' ?
    input.currentDir :
    defaults.CURRENT_DIR;
  output.outputDir = typeof input.outputDir === 'string' ?
    input.outputDir :
    defaults.OUTPUT_DIR;

  output.verbose = typeof input.verbose === 'boolean' ?
    input.verbose :
    false;
  output.recursive = typeof input.recursive === 'boolean' ?
    input.recursive :
    false;
  output.allVariations = typeof input.allVariations === 'boolean' ?
    input.allVariations :
    false;

  // Output file name modifier for including used method/type
  output.longDiffName = typeof input.longDiffName === 'boolean' ?
    input.longDiffName :
    false;

  // Callback when all commands have been iterated, called with metrics
  output.whenDone = typeof input.whenDone === 'function' ?
    input.whenDone :
    null;

  return output;
};
