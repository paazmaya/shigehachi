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

import path from 'path';

import tape from 'tape';

import diffImageFilename from '../../lib/diff-image-filename.js';

tape('diffImageFilename - uses configured diff directory', (test) => {
  test.plan(1);

  const filepath = diffImageFilename('old-book-by-mr-sonobe.png', {
    outputDir: 'not-same',
    metric: 'pae',
    style: 'tint',
    longDiffName: false
  });
  test.equal(filepath, path.join('not-same', 'old-book-by-mr-sonobe.png'), 'Resulting file is png');
});

tape('diffImageFilename - enforces diff image as png', (test) => {
  test.plan(1);

  const filepath = diffImageFilename('old-book-by-mr-sonobe.jpg', {
    outputDir: 'differences',
    metric: 'pae',
    style: 'tint',
    longDiffName: false
  });
  test.equal(filepath, path.join('differences', 'old-book-by-mr-sonobe.png'), 'Resulting file is png');
});

tape('diffImageFilename - enforces diff image as png even when it has no suffix', (test) => {
  test.plan(1);

  const filepath = diffImageFilename('old-book-by-mr-sonobe', {
    outputDir: 'differences',
    metric: 'pae',
    style: 'tint',
    longDiffName: false
  });
  test.equal(filepath, path.join('differences', 'old-book-by-mr-sonobe.png'), 'Resulting file is png');
});

tape('diffImageFilename - gets more details when longDiffName used', (test) => {
  test.plan(1);

  const filepath = diffImageFilename('old-book-by-mr-sonobe', {
    outputDir: 'differences',
    metric: 'pae',
    style: 'tint',
    longDiffName: true
  });
  test.equal(filepath, path.join('differences', 'old-book-by-mr-sonobe-pae-tint.png'),
    'Resulting file contains default metric');
});
