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

const fs = require('fs');

const tape = require('tape'),
  commandExecution = require('../../lib/command-execution');

tape('commandExecution - false when checking version', function (test) {
  test.plan(1);

  test.notOk(commandExecution(['version']));
});

tape('commandExecution - should success with compare', function (test) {
  test.plan(3);

  const output = commandExecution([
    'compare',
    '-metric mae',
    '-highlight-color purple',
    '-highlight-style xor',
    '-file tmp/square-mae-xor.png',
    'tests/fixtures/prev/square.png',
    'tests/fixtures/curr/square.png'
  ]);

  test.equal(output.A, 'tests/fixtures/prev/square.png');
  test.equal(output.B, 'tests/fixtures/curr/square.png');
  test.ok(fs.existsSync('tmp/square-mae-xor.png'), 'Diff image is generated');
});

tape('commandExecution - should fail with compare', function (test) {
  test.plan(1);

  const output = commandExecution([
    'compare',
    '-file tmp/square-mae-xor-2.png',
    'tests/fixtures/prev/square.png',
    'tests/fixtures/curr/square.png'
  ]);

  test.notOk(output);
});

tape('commandExecution - should fail with unknow', function (test) {
  test.plan(1);

  const output = commandExecution([
    'unknown'
  ]);

  test.notOk(output);
});
