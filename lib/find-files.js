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

const fs = require('fs');

const filterDir = require('./filter-dir');

/**
 * Filter the previous directory for image files
 *
 * @param {string}   directory Directory which will be searched for image files
 * @param {object}   options Configuration options
 * @param {boolean}  options.verbose More information to the console
 * @param {RegExp}   options.match Input file matcher
 * @param {boolean}  options.recursive Recursively find images from previousDir
 * @returns {Array}
 */
const findFiles = (directory, options) => {
  try {
    fs.accessSync(directory);
  }
  catch (error) {
    if (options.verbose) {
      console.error(`Directory "${directory}" can not be accessed`);
    }

    return [];
  }

  const list = filterDir(directory, null, {
    recursive: options.recursive,
    match: options.match
  });

  if (options.verbose) {
    console.log(`Found total of ${list.length} image files`);
  }

  return list;
};

module.exports = findFiles;
