/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

/* eslint-disable max-lines-per-function, max-statements */

const tape = require('tape');

const sanitizeOptions = require('../../lib/sanitize-options');

tape('sanitizeOptions - plenty of defaults', (test) => {
  test.plan(1);

  const output = sanitizeOptions();
  test.equal(Object.keys(output).length, 13);
});

tape('sanitizeOptions - default options gets set with expected values', (test) => {
  test.plan(13);
  const output = sanitizeOptions();

  test.equal(output.metric, 'pae', 'Metric is PeakAbsoluteError');
  test.equal(output.style, 'tint', 'Style is tint');
  test.equal(output.color, 'pink', 'Color is pink, nothing else');
  test.equal(output.compose, 'difference', 'Compose is difference');
  test.ok(output.verbose === false, 'Verbosity is boolean false');
  test.ok(output.recursive === false, 'Recursive is boolean false');
  test.equal(output.match.source, '\\.png$', 'Matching regular expression');
  test.ok(output.longDiffName === false, 'longDiffName is boolean false');
  test.equal(output.previousDir, 'previous', 'Previous directory');
  test.equal(output.currentDir, 'current', 'Current directory');
  test.equal(output.outputDir, 'difference', 'Difference directory');
  test.equal(output.whenDone, null, 'Callback is null');
  test.ok(output.allVariations === false, 'allVariations is boolean false');
});

tape('sanitizeOptions - algorithm and directory options gets set', (test) => {
  test.plan(8);

  const output = sanitizeOptions({
    metric: 'psnr',
    style: 'xor',
    color: 'purple',
    compose: 'bumpmap',
    recursive: true,
    previousDir: '1',
    currentDir: '2',
    outputDir: '3'
  });

  test.equal(output.metric, 'psnr', 'Metric becomes PeakSignalToNoiseRatio');
  test.equal(output.style, 'xor', 'Style is xor');
  test.equal(output.color, 'purple', 'Color is purple');
  test.equal(output.compose, 'bumpmap', 'Compose is bumpmap');
  test.ok(output.recursive === true, 'Recursive is boolean true');
  test.equal(output.previousDir, '1', 'Previous directory');
  test.equal(output.currentDir, '2', 'Current directory');
  test.equal(output.outputDir, '3', 'Difference directory');
});

tape('sanitizeOptions - other options gets set', (test) => {
  test.plan(6);

  const output = sanitizeOptions({
    verbose: true,
    match: '\\.(png|jpg|gif)$',
    longDiffName: true,
    allVariations: true,
    whenDone: () => {}
  });

  test.ok(output.verbose === true, 'Verbosity is boolean true');
  test.ok(output.match instanceof RegExp, 'Match is an Regular Expression');
  test.equal(output.match.source, '\\.(png|jpg|gif)$', 'Matching regular expression');
  test.ok(output.longDiffName === true, 'longDiffName is boolean true');
  test.ok(output.allVariations === true, 'allVariations is boolean true');
  test.equal(typeof output.whenDone, 'function', 'Callback is a function');
});

tape('sanitizeOptions - wrong type of options get ignored', (test) => {
  test.plan(13);

  const output = sanitizeOptions({
    metric: [],
    style: 20,
    color: {},
    compose: 1234,
    recursive: 'yes please',
    previousDir: 100,
    currentDir: true,
    outputDir: {},
    verbose: 'yes',
    match: false,
    allVariations: new Date(),
    longDiffName: 'hello there',
    whenDone: 'callback me not'
  });

  test.equal(output.metric, 'pae', 'Metric is the default');
  test.equal(output.style, 'tint', 'Style is the default');
  test.equal(output.color, 'pink', 'Color is pink, nothing else');
  test.equal(output.compose, 'difference', 'Compose is difference');
  test.ok(output.verbose === false, 'Verbosity is boolean false');
  test.ok(output.recursive === false, 'Recursive is boolean false');
  test.equal(output.match.source, '\\.png$', 'Matching regular expression');
  test.ok(output.longDiffName === false, 'longDiffName is boolean false');
  test.equal(output.previousDir, 'previous', 'Previous directory');
  test.equal(output.currentDir, 'current', 'Current directory');
  test.equal(output.outputDir, 'difference', 'Difference directory');
  test.equal(output.whenDone, null, 'Callback is null');
  test.ok(output.allVariations === false, 'allVariations is boolean false');
});

tape('sanitizeOptions - metric option must be one of the predefined', (test) => {
  test.plan(1);

  const output = sanitizeOptions({
    metric: 'hoplaa'
  });

  test.equal(output.metric, 'pae', 'Metric is the default');
});

tape('sanitizeOptions - style option must be one of the predefined', (test) => {
  test.plan(1);

  const output = sanitizeOptions({
    style: 'hoplaa'
  });

  test.equal(output.style, 'tint', 'Style is the default');
});

tape('sanitizeOptions - compose option must be one of the predefined', (test) => {
  test.plan(1);

  const output = sanitizeOptions({
    compose: 'otherkind'
  });

  test.equal(output.compose, 'difference', 'Compose is the default');
});
