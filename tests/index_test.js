/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

/* eslint-disable handle-callback-err */

const fs = require('fs');

const tape = require('tape');

const Shigehachi = require('../index');


/*
tape('index - runner should fail when command not found', (test) => {
  test.plan(1);

  const instance = new Shigehachi();

  test.throws(instance._runner(['failing-sub-command']));
});
*/

tape('index - next runner calls callback when no more command queued', (test) => {
  test.plan(3);

  const instance = new Shigehachi({
    verbose: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures/curr',
    outputDir: 'tmp/diff',
    whenDone: (res) => {
      test.equal(Object.keys(res).length, 2);
      Object.keys(res).forEach((key) => {
        test.equal(res[key].metric, 'PeakAbsoluteError');
      });
    }
  });
  instance.exec();
});

tape('index - exec should not create commands when no files, but call next runner', (test) => {
  test.plan(2);

  const instance = new Shigehachi({
    verbose: true
  });

  instance._nextRun = () => {
    test.pass('Next iteration got called');
  };
  instance.exec();

  test.equal(instance.commandList.length, 0, 'Command list is empty');
});

tape('index - output directory gets created when it does not exist', (test) => {
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

tape('index - output directory gets created recursively when it does not exist', (test) => {
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

tape('index - when there is no matching current picture for previous...', (test) => {
  test.plan(1);

  const instance = new Shigehachi({
    verbose: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures',
    outputDir: 'tmp/diff-404'
  });

  instance.exec();
  test.equal(instance.commandList.length, 0);
});

tape('index - there are about three times commands than picture pairs', (test) => {
  test.plan(2);

  const instance = new Shigehachi({
    verbose: true,
    recursive: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures/curr',
    outputDir: 'tmp/diff-9-commands'
  });

  instance._nextRun = () => {
    test.pass('Next iteration got called');
  };
  instance.exec();

  test.equal(instance.commandList.length, 9, 'Command list has few of items');
});

tape('index - allVariations creates much more commands', (test) => {
  test.plan(2);

  const instance = new Shigehachi({
    verbose: false,
    recursive: true,
    allVariations: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures/curr',
    outputDir: 'tmp/diff-many-commands'
  });

  instance._nextRun = () => {
    test.pass('Next iteration got called');
  };
  instance.exec();

  test.equal(instance.commandList.length, 3960, 'Command list has plenty of items');
});
