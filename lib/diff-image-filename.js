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


const path = require('path');

const MATCH_PNG = /\.png$/u;
const SUFFIX = '.png';

/**
 * Generate the difference image file path for the given image file.
 * It will parse any filename template and use 'png' as a suffix.
 *
 * @param {string}   picture Basename of the image file
 * @param {object}   options Configuration options
 * @param {string}   options.outputDir Difference images are generated here
 * @param {string}   options.metric  Metric algorithm used by GraphicsMagick
 * @param {string}   options.style   Style in which the differentiation image is created
 * @param {boolean}  options.allVariations Shall all the possible metric and compose variations generated. Applies longDiffName
 * @param {boolean}  options.longDiffName Use longer difference image file name
 * @returns {string} Full path to the difference image
 */
module.exports = (picture, options) => {
  let filepath = path.join(options.outputDir, picture);

  if (filepath.indexOf(SUFFIX, filepath.length - SUFFIX.length) === -1) {
    const last = filepath.lastIndexOf('.');
    filepath = filepath.substr(0, last !== -1 ?
      last :
      filepath.length) + SUFFIX;
  }

  if (options.longDiffName || options.allVariations) {
    filepath = filepath.replace(MATCH_PNG, '-' + options.metric + '-' + options.style + SUFFIX);
  }

  return filepath;
};
