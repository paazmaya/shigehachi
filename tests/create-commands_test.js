/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

'use strict';

const tape = require('tape'),
  createCommands = require('../lib/create-commands');

tape('create composite command', function (test) {
  test.plan(1);

  const diff = 'difference.png';
  const prev = 'previous.png';
  const curr = 'current.png';
  const settings = {
    metric: 'psnr',
    style: 'assign',
    color: 'purple',
    compose: 'copycyan'
  };
  const args = createCommands.composite(diff, prev, curr, settings);

  test.deepEqual(args, [
    'composite',
    curr,
    prev,
    '-compose',
    'copycyan',
    'difference-composite.png'
  ], 'Returned arguments are correct');
});

tape('create composite command uses longDiffName', function (test) {
  test.plan(1);

  const diff = 'difference.png';
  const prev = 'previous.png';
  const curr = 'current.png';
  const settings = {
    metric: 'psnr',
    style: 'assign',
    color: 'purple',
    compose: 'copycyan',
    longDiffName: true
  };
  const args = createCommands.composite(diff, prev, curr, settings);

  test.deepEqual(args, [
    'composite',
    curr,
    prev,
    '-compose',
    'copycyan',
    'difference-composite-copycyan.png'
  ], 'Returned arguments are correct');
});

tape('create compare command', function (test) {
  test.plan(1);

  const diff = 'difference image.png';
  const prev = 'previous image.png';
  const curr = 'current image.png';
  const settings = {
    metric: 'psnr',
    style: 'assign',
    color: 'purple'
  };
  const args = createCommands.compare(diff, prev, curr, settings);

  test.deepEqual(args, [
    'compare',
    '-metric',
    'psnr',
    '-highlight-color',
    'purple',
    '-highlight-style',
    'assign',
    '-file',
    'difference image.png',
    'previous image.png',
    'current image.png'
  ], 'Returned arguments are correct');
});

tape('create negate command', function (test) {
  test.plan(1);

  const diff = 'difference.png';
  const args = createCommands.negate(diff);

  test.deepEqual(args, [
    'convert',
    '-negate',
    'difference.png',
    'difference-negate.png'
  ], 'Returned arguments are correct');
});
