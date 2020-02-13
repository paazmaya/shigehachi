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
  ensureDirectory = require('../../lib/ensure-directory');

tape('ensureDirectory - false when already existed', function (test) {
  test.plan(1);

  test.notOk(ensureDirectory(__dirname));
});

tape('ensureDirectory - true when new created', function (test) {
  test.plan(1);

  test.ok(ensureDirectory('tmp/1234'));
});
