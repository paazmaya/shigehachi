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
const fs = require('fs-extra');

const MATCH_PNG = /\.png$/ui;

/**
 * Find all image files in the given directory path, possible
 * using recursion if options wish so to happen.
 * @param {string} basedir Directory which will be searched for image files
 * @param {string} subdir Possible sub directory path under dirpath
 * @param {Object} options Configuration options
 * @param {RegExp} options.match File matcher expression
 * @param {boolean} options.recursive Should the directories be recursively searched
 * @returns {array} List of image file paths relative to the initial dirpath
 */
const filterDir = (basedir, subdir, options) => {
  subdir = subdir || '';
  options = options || {};
  options.match = options.match || MATCH_PNG;

  const dirpath = path.join(basedir, subdir);
  const dir = fs.readdirSync(dirpath);

  let images = [];

  dir.forEach((item) => {
    const filepath = path.join(dirpath, item); // full path
    const itempath = path.join(subdir, item); // relative path to basedir
    const stat = fs.statSync(filepath);
    if (options.recursive && stat.isDirectory()) {
      images = images.concat(filterDir.call(this, basedir, itempath, options));
    }
    if (stat.isFile() && options.match.test(item)) {
      images.push(itempath);
    }
  });

  return images;
};

module.exports = filterDir;
