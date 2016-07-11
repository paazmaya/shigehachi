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
 * Called when the given 'gm compare' command has not failed and parses the output
 * @param {string} output Output from a 'gm compare' command
 * @returns {Object|boolean} Normalised metrics or false when could not be parsed
 */
module.exports = function parseMetrics(output) {

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
      return {
        metric: metric[1],
        normalised: norm
      };
    }
    return false;
  }
  return false;
};
