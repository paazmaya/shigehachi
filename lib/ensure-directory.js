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

import fs from 'fs-extra';

/**
 * Check that the given directory exists and when it does not, create it recursively.
 *
 * @param {string} directory Directory which should be ensured to exist
 * @returns {boolean} True when the directory needed to be created, false when already existed
 */
export default (directory) => {

  try {
    fs.accessSync(directory);
  }
  catch {
    fs.mkdirpSync(directory);

    return true;
  }

  return false;
};
