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

import {
  execSync
} from 'child_process';

import parseMetrics from './parse-metrics.js';
import defaults from './defaults.js';

const getMetrics = (stdout, gmArgs) => {
  const currPicture = gmArgs.pop();
  const prevPicture = gmArgs.pop();
  const diffPicture = gmArgs.pop();
  const negateFile = diffPicture.replace(defaults.MATCH_PNG, '-negate.png');

  const metrics = parseMetrics(stdout);
  if (metrics) {
    metrics.A = prevPicture;
    metrics.B = currPicture;
    metrics.D = diffPicture;
    metrics.N = negateFile;

    return metrics;
  }

  return false;
};

/**
 * Execute a command with 'gm'
 *
 * @param {array}    gmArgs List of arguments passed to the binary command
 * @returns {object|boolean} Metrics data or false
 */
const commandExecution = (gmArgs) => {
  const command = 'gm ' + gmArgs.join(' ');

  try {
    const stdout = execSync(command, {
      encoding: 'utf8'
    });

    if (gmArgs[0] === 'compare') {
      return getMetrics(stdout, gmArgs);
    }
  }
  catch (error) {
    console.error('Error occurred when running GraphicsMagick command');
    console.error(error);
  }

  return false;
};

export default commandExecution;
