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

/**
 * Creates the initial comparison command with 'gm compare' and adds
 * it to the command list.
 *
 * @param {string} diffPicture Path to the difference image file
 * @param {string} prevPicture Path to the previous image file
 * @param {string} currPicture Path to the current image file
 * @param {Object} settings Options object
 * @param {string} settings.metric Settings used for metric
 * @param {string} settings.color Settings used for color
 * @param {string} settings.style Settings used for style
 * @returns {void}
 * @see http://www.graphicsmagick.org/compare.html
 */
const compare = function _compare(diffPicture, prevPicture, currPicture, settings) {
  const compareArgs = [
    'compare',
    '-metric',
    settings.metric,
    '-highlight-color',
    '"' + settings.color + '"',
    '-highlight-style',
    settings.style,
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
 * @param {Object} settings Options object
 * @param {boolean} settings.longDiffName Configuration for using long names
 * @param {string} settings.compose Settings used for compose
 * @returns {void}
 * @see http://www.graphicsmagick.org/composite.html
 */
const composite = function _composite(diffPicture, prevPicture, currPicture, settings) {
  let append = '-composite';
  if (settings.longDiffName) {
    append += '-' + settings.compose;
  }
  const compositeFile = diffPicture.replace(/\.png$/, append + '.png');

  const compositeArgs = [
    'composite',
    currPicture,
    prevPicture,
    '-compose',
    settings.compose,
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
const negate = function _negate(diffPicture) {
  const negateFile = diffPicture.replace(/\.png$/, '-negate.png');

  const convertArgs = [
    'convert',
    '-negate',
    diffPicture,
    negateFile
  ];

  return convertArgs;
};

module.exports = {
  compare: compare,
  composite: composite,
  negate: negate
};