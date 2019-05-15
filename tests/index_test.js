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

const fs = require('fs'),
  path = require('path');

const tape = require('tape'),
  Shigehachi = require('../index');

tape('index - default options gets set', function (test) {
  test.plan(12);

  const instance = new Shigehachi();

  test.equal(instance.metric, 'pae', 'Metric is PeakAbsoluteError');
  test.equal(instance.style, 'tint', 'Style is tint');
  test.equal(instance.color, 'pink', 'Color is pink, nothing else');
  test.equal(instance.compose, 'difference', 'Compose is difference');
  test.ok(instance.verbose === false, 'Verbosity is boolean false');
  test.ok(instance.recursive === false, 'Recursive is boolean false');
  test.equal(instance.match.source, '\\.png$', 'Matching regular expression');
  test.ok(instance.longDiffName === false, 'longDiffName is boolean false');
  test.equal(instance.previousDir, 'previous', 'Previous directory');
  test.equal(instance.currentDir, 'current', 'Current directory');
  test.equal(instance.outputDir, 'difference', 'Difference directory');
  test.equal(instance.whenDone, null, 'Callback is null');
});

tape('index - algorithm and directory options gets set', function (test) {
  test.plan(8);

  const instance = new Shigehachi({
    metric: 'psnr',
    style: 'xor',
    color: 'purple',
    compose: 'bumpmap',
    recursive: true,
    previousDir: '1',
    currentDir: '2',
    outputDir: '3'
  });

  test.equal(instance.metric, 'psnr', 'Metric becomes PeakSignalToNoiseRatio');
  test.equal(instance.style, 'xor', 'Style is xor');
  test.equal(instance.color, 'purple', 'Color is purple');
  test.equal(instance.compose, 'bumpmap', 'Compose is bumpmap');
  test.ok(instance.recursive === true, 'Recursive is boolean true');
  test.equal(instance.previousDir, '1', 'Previous directory');
  test.equal(instance.currentDir, '2', 'Current directory');
  test.equal(instance.outputDir, '3', 'Difference directory');
});

tape('index - other options gets set', function (test) {
  test.plan(5);

  const instance = new Shigehachi({
    verbose: true,
    match: '\\.(png|jpg|gif)$',
    longDiffName: true,
    whenDone: function () {}
  });

  test.ok(instance.verbose === true, 'Verbosity is boolean true');
  test.ok(instance.match instanceof RegExp, 'Match is an Regular Expression');
  test.equal(instance.match.source, '\\.(png|jpg|gif)$', 'Matching regular expression');
  test.ok(instance.longDiffName === true, 'longDiffName is boolean true');
  test.equal(typeof instance.whenDone, 'function', 'Callback is a function');
});

tape('index - wrong type of options get ignored', function (test) {
  test.plan(12);

  const instance = new Shigehachi({
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
    longDiffName: 'hello there',
    whenDone: 'callback me not'
  });

  test.equal(instance.metric, 'pae', 'Metric is the default');
  test.equal(instance.style, 'tint', 'Style is the default');
  test.equal(instance.color, 'pink', 'Color is pink, nothing else');
  test.equal(instance.compose, 'difference', 'Compose is difference');
  test.ok(instance.verbose === false, 'Verbosity is boolean false');
  test.ok(instance.recursive === false, 'Recursive is boolean false');
  test.equal(instance.match.source, '\\.png$', 'Matching regular expression');
  test.ok(instance.longDiffName === false, 'longDiffName is boolean false');
  test.equal(instance.previousDir, 'previous', 'Previous directory');
  test.equal(instance.currentDir, 'current', 'Current directory');
  test.equal(instance.outputDir, 'difference', 'Difference directory');
  test.equal(instance.whenDone, null, 'Callback is null');
});

tape('index - metric option must be one of the predefined', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    metric: 'hoplaa'
  });

  test.equal(instance.metric, 'pae', 'Metric is the default');
});

tape('index - style option must be one of the predefined', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    style: 'hoplaa'
  });

  test.equal(instance.style, 'tint', 'Style is the default');
});

tape('index - compose option must be one of the predefined', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    compose: 'otherkind'
  });

  test.equal(instance.compose, 'difference', 'Compose is the default');
});

tape('index - no files found when no matching expression', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    previousDir: 'tests/fixtures/prev/',
    match: '\\.(tiff|bmp)$'
  });
  instance._readPrevDir(instance.previousDir);

  test.equal(instance.capturedPrev.length, 0, 'Previous images list is empty');
});

tape('index - image files found when matching expression', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    previousDir: 'tests/fixtures/prev/',
    match: '\\.(png|gif)$',
    verbose: true
  });
  instance._readPrevDir(instance.previousDir);

  test.equal(instance.capturedPrev.length, 2, 'Previous images list contains files from base level of the previous dir');
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
