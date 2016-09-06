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
 * Acceptable composition values
 * @var {array}
 * @see http://www.graphicsmagick.org/GraphicsMagick.html#details-compose
 */
const composeTypes = [
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
 * Acceptable metric values
 * @var {array}
 * @see http://www.graphicsmagick.org/compare.html
 */
const metricTypes = [
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
const styleTypes = [
  'assign',
  'threshold',
  'tint',
  'xor'
];

module.exports = {
  compose: composeTypes,
  metric: metricTypes,
  style: styleTypes
};
