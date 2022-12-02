/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

import tape from 'tape';

import filterDir from '../../lib/filter-dir.js';

tape('filterDir - filter directories recursively', (test) => {
  test.plan(1);

  const images = filterDir('tests/fixtures/curr', null, {
    recursive: true
  });

  test.equal(images.length, 3, 'All png images were found');
});

tape('filterDir - filter directories does not complain with missing settings', (test) => {
  test.plan(1);

  const images = filterDir('tests/fixtures/curr');

  test.equal(images.length, 2, 'Just two found');
});

tape('filterDir - no files found when no matching expression', (test) => {
  test.plan(1);

  const list = filterDir('tests/fixtures/prev/', null, {
    match: /\.(tiff|bmp)$/iu
  });

  test.equal(list.length, 0, 'Previous images list is empty');
});

tape('filterDir - image files found when matching expression', (test) => {
  test.plan(1);

  const list = filterDir('tests/fixtures/prev/', null, {
    match: /\.(png|gif)$/iu,
    verbose: true
  });

  test.equal(list.length, 3, 'Previous images list contains files from base level of the previous dir');
});
