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

tape('default options gets set', function (test) {
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
  test.equal(instance.prevDir, 'previous', 'Previous directory');
  test.equal(instance.currDir, 'current', 'Current directory');
  test.equal(instance.diffDir, 'difference', 'Difference directory');
  test.equal(instance.whenDone, null, 'Callback is null');
});

tape('algorithm and directory options gets set', function (test) {
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
  test.equal(instance.prevDir, '1', 'Previous directory');
  test.equal(instance.currDir, '2', 'Current directory');
  test.equal(instance.diffDir, '3', 'Difference directory');
});

tape('other options gets set', function (test) {
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

tape('wrong type of options get ignored', function (test) {
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
  test.equal(instance.prevDir, 'previous', 'Previous directory');
  test.equal(instance.currDir, 'current', 'Current directory');
  test.equal(instance.diffDir, 'difference', 'Difference directory');
  test.equal(instance.whenDone, null, 'Callback is null');
});

tape('metric option must be one of the predefined', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    metric: 'hoplaa'
  });

  test.equal(instance.metric, 'pae', 'Metric is the default');
});

tape('style option must be one of the predefined', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    style: 'hoplaa'
  });

  test.equal(instance.style, 'tint', 'Style is the default');
});

tape('compose option must be one of the predefined', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    compose: 'otherkind'
  });

  test.equal(instance.compose, 'difference', 'Compose is the default');
});

tape('no files found when no matching expression', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    previousDir: 'tests/fixtures/prev/',
    match: '\\.(tiff|bmp)$'
  });
  instance._readPrevDir(instance.prevDir);

  test.equal(instance.capturedPrev.length, 0, 'Previous images list is empty');
});

tape('image files found when matching expression', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    previousDir: 'tests/fixtures/prev/',
    match: '\\.(png|gif)$',
    verbose: true
  });
  instance._readPrevDir(instance.prevDir);

  test.equal(instance.capturedPrev.length, 2, 'Previous images list contains files from base level of the previous dir');
});
/*
tape('runner should fail when command not found', function (test) {
  test.plan(1);

  const instance = new Shigehachi();

  test.throws(instance._runner(['failing-sub-command']));
});
*/

tape('runner should call _successRan when command is using compare', function (test) {
  test.plan(2);

  const instance = new Shigehachi({
    verbose: true
  });

  instance._successRan = function (stdout, currFile) {
    test.equal(currFile, 'tests/fixtures/curr/young-girl.gif', 'Callback called with the given filename');
  };
  instance._nextRun = function () {
    test.pass('Next iteration got called');
  };
  instance._runner(['compare', 'tests/fixtures/prev/young-girl.gif', 'tests/fixtures/curr/young-girl.gif']);
});

tape('gm output with version info', function (test) {
  test.plan(1);

  const output = [
    'GraphicsMagick 1.3.21 2015-02-28 Q8 http://www.GraphicsMagick.org/',
    'Copyright (C) 2002-2014 GraphicsMagick Group.',
    'Additional copyrights and licenses apply to this software.',
    'See http://www.GraphicsMagick.org/www/Copyright.html for details.'
  ].join('\n');
  const filepath = 'tests/fixtures/curr/postcss.png';

  const instance = new Shigehachi();
  instance._successRan(output, filepath);

  test.notOk(instance.results.hasOwnProperty(filepath), 'Results were not added');
});

tape('next runner calls runner', function (test) {
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

tape('next runner calls callback when no more command queued', function (test) {
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


tape('exec should not create commands when no files, but call next runner', function (test) {
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

tape('exec creates commands and calls next runner', function (test) {
  test.plan(2);

  const instance = new Shigehachi({
    verbose: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures/curr',
    match: '\\.gif$'
  });

  instance._nextRun = function () {
    test.pass('Next iteration got called');
  };
  instance.exec();

  test.equal(instance.commandList.length, 3, 'Command list contains items');
});

tape('diffFilename uses configured diff directory', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    outputDir: 'not-same'
  });

  const result = instance._diffFilename('old-book-by-mr-sonobe.png');
  test.equal(result, path.join('not-same', 'old-book-by-mr-sonobe.png'), 'Resulting file is png');
});

tape('diffFilename enforces diff image as png', function (test) {
  test.plan(1);

  const instance = new Shigehachi();

  const result = instance._diffFilename('old-book-by-mr-sonobe.jpg');
  test.equal(result, path.join('difference', 'old-book-by-mr-sonobe.png'), 'Resulting file is png');
});

tape('diffFilename enforces diff image as png even when it has no suffix', function (test) {
  test.plan(1);

  const instance = new Shigehachi();

  const result = instance._diffFilename('old-book-by-mr-sonobe');
  test.equal(result, path.join('difference', 'old-book-by-mr-sonobe.png'), 'Resulting file is png');
});

tape('diffFilename gets more details when longDiffName used', function (test) {
  test.plan(1);

  const instance = new Shigehachi({
    longDiffName: true
  });

  const result = instance._diffFilename('old-book-by-mr-sonobe');
  test.equal(result, path.join('difference', 'old-book-by-mr-sonobe-pae-tint.png'), 'Resulting file contains default metric');
});

tape('output directory gets created when it does not exist', function (test) {
  test.plan(2);

  const diffDir = 'tmp/diff-' + (new Date()).getTime();
  const instance = new Shigehachi({
    verbose: true,
    match: 'nothing$',
    outputDir: diffDir
  });

  test.ok(fs.existsSync(diffDir) === false, 'Output directory does not exist initially');
  instance.exec();
  test.ok(fs.existsSync(diffDir) === true, 'Output directory exists after execution');
});

tape('output directory gets created recursively when it does not exist', function (test) {
  test.plan(2);

  const diffDir = 'tmp/diff-' + (new Date()).getTime();
  const instance = new Shigehachi({
    verbose: true,
    recursive: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures/curr',
    outputDir: diffDir
  });

  test.ok(fs.existsSync(diffDir + '/website') === false, 'Output child directory does not exist initially');
  instance.exec();
  test.ok(fs.existsSync(diffDir + '/website') === true, 'Output child directory exists after execution');
});
