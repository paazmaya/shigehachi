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

const fs = require('fs-extra'),
  path = require('path');

/**
 * Find all image files in the given directory path, possible
 * using recursion if options wish so to happen.
 * @param {string} basedir Directory which will be searched for image files
 * @param {string} parent Possible sub directory path under dirpath
 * @param {Object} settings Configuration options
 * @param {RegExp} settings.match File matcher
 * @param {boolean} settings.recursive Should the directories be recursively searched
 * @returns {array} List of image file paths relative to the initial dirpath
 */
module.exports = function filterDir(basedir, parent, settings) {
  parent = parent || '';
  settings = settings || {};
  settings.match = settings.match || /\.png$/;

  const dirpath = path.join(basedir, parent);
  const dir = fs.readdirSync(dirpath);

  let images = [];

  dir.forEach((item) => {
    const filepath = path.join(dirpath, item); // full path
    const itempath = path.join(parent, item); // relative path to basedir
    if (settings.recursive) {
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        images = images.concat(filterDir.call(this, basedir, itempath, settings));
      }
    }
    if (item.match(settings.match)) {
      images.push(itempath);
    }
  });

  return images;
};