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

const {
  execSync
} = require('child_process');

const parseMetrics = require('./parse-metrics');

const parseOutput = (stdout, gmArgs) => {

  if (gmArgs[0] === 'compare') {
    const currPicture = gmArgs.pop();
    const prevPicture = gmArgs.pop();
    const diffPicture = gmArgs.pop();

    const metrics = parseMetrics(stdout);
    if (metrics) {
      metrics.A = prevPicture;
      metrics.B = currPicture;
      metrics.diff = diffPicture;

      return metrics;
    }
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

    return parseOutput(stdout, gmArgs);
  }
  catch (error) {
    console.error('Error occurred when running GraphicsMagick command');
    console.error(error);
  }

  return false;
};

module.exports = commandExecution;
