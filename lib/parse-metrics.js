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


/**
 * Called when the given 'gm compare' command has not failed and parses the output
 * @param {string} output Output from a 'gm compare' command
 * @returns {Object|boolean} Normalised metrics or false when could not be parsed
 */
export default (output) => {

  // Regular expressions for catching numbers from GraphicMagick output
  const MATCH_METRIC = /^Image Difference\s+\((\w+)\):\s*?/gmiu;
  const MATCH_NAMES = /^\s+([\w]+)\s*([\w]+)?/gmiu;

  // Numeric values of the first column
  const MATCH_VALUES1 = /^\s+(\w+):\s+([\d.]+)/gmiu;

  // Numeric values of the second column
  const MATCH_VALUES2 = /^\s+(\w+):\s+[\d.]+\s+([\d.]+)/gmiu;

  const metric = MATCH_METRIC.exec(output);
  const names = MATCH_NAMES.exec(output);
  if (metric && names) {
    const data = {
      metric: metric[1]
    };
    const normalized = {};
    const absolute = {};
    let parsed;

    while ((parsed = MATCH_VALUES1.exec(output)) !== null) {
      normalized[parsed[1].toLowerCase()] = parsed[2];
    }
    data[names[1].toLowerCase()] = normalized;
    if (names[2]) {
      while ((parsed = MATCH_VALUES2.exec(output)) !== null) {
        absolute[parsed[1].toLowerCase()] = parsed[2];
      }
      data[names[2].toLowerCase()] = absolute;
    }

    // Since all metric methods output a total value, use it for safeguarding
    if (Object.prototype.hasOwnProperty.call(normalized, 'total')) {
      return data;
    }

    return false;
  }

  return false;
};
