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

const fs = require('fs');

const tape = require('tape'),
  filterDir = require('../lib/filter-dir');

tape('filter directories recursively', function (test) {
  test.plan(1);

  const images = filterDir('tests/fixtures/curr', null, {
    recursive: true
  });

  test.equal(images.length, 2, 'Both png images were found');
});

tape('filter directories does not complain with missing settings', function (test) {
  test.plan(1);

  const images = filterDir('tests/fixtures/curr');

  test.equal(images.length, 1, 'Just one found');
});
