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

import defaults from './defaults.js';

/**
 * Creates the initial comparison command with 'gm compare'.
 *
 * @param {string} diffPicture Path to the difference image file
 * @param {string} prevPicture Path to the previous image file
 * @param {string} currPicture Path to the current image file
 * @param {Object} settings Options object
 * @param {string} settings.metric Settings used for metric
 * @param {string} settings.color Settings used for color
 * @param {string} settings.style Settings used for style
 * @returns {Array} Command arguments for `gm`
 * @see http://www.graphicsmagick.org/compare.html
 */
const compare = (diffPicture, prevPicture, currPicture, settings) => {
  return [
    'compare',
    '-metric',
    settings.metric,
    '-highlight-color',
    settings.color,
    '-highlight-style',
    settings.style,
    '-file',
    diffPicture,
    prevPicture,
    currPicture
  ];
};

/**
 * Creates the composite command.
 *
 * The order of the images is relevant as the first is the changed,
 * and the second if the original.
 *
 * @param {string} diffPicture Path to the difference image file, assumed to have '.png' suffix
 * @param {string} prevPicture Path to the previous image file
 * @param {string} currPicture Path to the current image file
 * @param {Object} settings Options object
 * @param {boolean} settings.longDiffName Configuration for using long names
 * @param {boolean} settings.allVariations Shall all the possible metric and compose variations generated. Applies longDiffName
 * @param {string} settings.compose Settings used for compose
 * @returns {Array} Command arguments for `gm`
 * @see http://www.graphicsmagick.org/composite.html
 */
const composite = (diffPicture, prevPicture, currPicture, settings) => {
  let append = '-composite';
  if (settings.longDiffName) {
    append += '-' + settings.compose;
  }
  const compositeFile = diffPicture.replace(defaults.MATCH_PNG, append + '.png');

  return [
    'composite',
    currPicture,
    prevPicture,
    '-compose',
    settings.compose,
    compositeFile
  ];
};

/**
 * Creates the negation command.
 *
 * @param {string} diffPicture Path to the difference image file, assumed to have '.png' suffix
 * @returns {Array} Command arguments for `gm`
 * @see http://www.graphicsmagick.org/convert.html
 */
const negate = (diffPicture) => {
  const negateFile = diffPicture.replace(defaults.MATCH_PNG, '-negate.png');

  return [
    'convert',
    '-negate',
    diffPicture,
    negateFile
  ];
};

export default {
  compare: compare,
  composite: composite,
  negate: negate
};
