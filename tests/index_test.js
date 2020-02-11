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
  Shigehachi = require('../index');


tape('index - no files found when no matching expression', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    previousDir: 'tests/fixtures/prev/',
    match: '\\.(tiff|bmp)$'
  });
  instance._readPrevDir(instance.options.previousDir);

  test.equal(instance.capturedPrev.length, 0, 'Previous images list is empty');
});

tape('index - image files found when matching expression', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    previousDir: 'tests/fixtures/prev/',
    match: '\\.(png|gif)$',
    verbose: true
  });
  instance._readPrevDir(instance.options.previousDir);

  test.equal(instance.capturedPrev.length, 3, 'Previous images list contains files from base level of the previous dir');
});
/*
tape('index - runner should fail when command not found', function (test) {
  test.plan(1);

  const instance = new Shigehachi();

  test.throws(instance._runner(['failing-sub-command']));
});
*/

tape('index - next runner calls runner', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    verbose: true
  });
  instance.commandList = [['version']];

  instance._runner = function (args) {
    test.deepEqual(args, ['version'], 'Runner got called with expected arguments');
  };

  instance._nextRun();
});

tape('index - next runner calls callback when no more command queued', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    verbose: true,
    whenDone: function (res) {
      test.deepEqual(res, {
        filepath: 'results'
      }, 'Callback got called with expected arguments');
    }
  });
  instance.results = {
    filepath: 'results'
  };

  instance._nextRun();
});

tape('index - exec should not create commands when no files, but call next runner', function (test) {
  test.plan(2);

  const instance = new Shigehachi({
    verbose: true
  });

  instance._nextRun = function () {
    test.pass('Next iteration got called');
  };
  instance.exec();

  test.equal(instance.commandList.length, 0, 'Command list is empty');
});

tape('index - output directory gets created when it does not exist', function (test) {
  test.plan(2);

  const outputDir = 'tmp/diff-' + (new Date()).getTime();
  const instance = new Shigehachi({
    verbose: true,
    match: 'nothing$',
    outputDir: outputDir
  });

  test.ok(fs.existsSync(outputDir) === false, 'Output directory does not exist initially');
  instance.exec();
  test.ok(fs.existsSync(outputDir) === true, 'Output directory exists after execution');
});

tape('index - output directory gets created recursively when it does not exist', function (test) {
  test.plan(2);

  const outputDir = 'tmp/diff-' + (new Date()).getTime();
  const instance = new Shigehachi({
    verbose: true,
    recursive: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures/curr',
    outputDir: outputDir
  });

  test.ok(fs.existsSync(outputDir + '/website') === false, 'Output child directory does not exist initially');
  instance.exec();
  test.ok(fs.existsSync(outputDir + '/website') === true, 'Output child directory exists after execution');
});
