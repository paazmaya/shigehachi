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


/*
tape('index - runner should fail when command not found', function (test) {
  test.plan(1);

  const instance = new Shigehachi();

  test.throws(instance._runner(['failing-sub-command']));
});
*/

tape('index - next runner calls callback when no more command queued', function (test) {
  test.plan(2);

  const instance = new Shigehachi({
    verbose: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures/curr',
    outputDir: 'tmp/diff',
    whenDone: function (res) {
      test.equal(Object.keys(res).length, 2);
      test.ok(Object.keys(res).indexOf('337ad3c782aea18879beac21669df377') !== -1);
    }
  });
  instance.exec();
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
