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
  filterDir = require('../../lib/filter-dir');

tape('filterDir - filter directories recursively', function (test) {
  test.plan(1);

  const images = filterDir('tests/fixtures/curr', null, {
    recursive: true
  });

  test.equal(images.length, 3, 'All png images were found');
});

tape('filterDir - filter directories does not complain with missing settings', function (test) {
  test.plan(1);

  const images = filterDir('tests/fixtures/curr');

  test.equal(images.length, 2, 'Just two found');
});
