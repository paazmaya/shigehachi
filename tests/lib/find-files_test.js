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

const path = require('path');

const tape = require('tape');

const findFiles = require('../../lib/find-files');

tape('findFiles - interface', (test) => {
  test.plan(2);

  test.equal(typeof findFiles, 'function', 'is a function');
  test.equal(findFiles.length, 2);
});

tape('findFiles - finds all png files under curr', (test) => {
  test.plan(1);

  const options = {
    verbose: true,
    recursive: true
  };
  const list = findFiles(path.join('tests', 'fixtures', 'curr'), options);
  test.equal(list.length, 3);
});

tape('findFiles - finds all image files under curr', (test) => {
  test.plan(1);

  const options = {
    verbose: false,
    recursive: true,
    match: /\.(gif|jpg|png)$/iu
  };
  const list = findFiles(path.join('tests', 'fixtures', 'curr'), options);
  test.equal(list.length, 5);
});

tape('findFiles - verbally complains when directory does not exist', (test) => {
  test.plan(1);

  const options = {
    verbose: true
  };
  const list = findFiles('not-here', options);
  test.equal(list.length, 0);
});

tape('findFiles - silent when directory does not exist', (test) => {
  test.plan(1);

  const options = {
    verbose: false
  };
  const list = findFiles('not-here', options);
  test.equal(list.length, 0);
});
