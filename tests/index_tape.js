/**
 * Shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya
 * Licensed under the MIT license
 */

'use strict';

var tape = require('tape'),
  Jikishin = require('../index');

tape('default options gets set', function (test) {
  test.plan(9);

  var instance = new Jikishin();

  test.equal(instance.metric, 'pae', 'Metric is PeakAbsoluteError');
  test.equal(instance.style, 'tint', 'Style is tint');
  test.equal(instance.color, '#85144b', 'Color is something in hex');
  test.ok(instance.verbose === false, 'Verbosity is boolean false');
  test.deepEqual(instance.suffixes, ['png'], 'Suffixes are an array with one value, png');
  test.equal(instance.prevDir, 'previous', 'Previous directory');
  test.equal(instance.currDir, 'current', 'Current directory');
  test.equal(instance.diffDir, 'difference', 'Difference directory');
  test.equal(instance.whenDone, null, 'Callback is null');
});

tape('algorithm and directory options gets set', function (test) {
  test.plan(6);

  var instance = new Jikishin({
		metric: 'psnr',
		style: 'xor',
		color: 'pink',
		previousDir: '1',
		currentDir: '2',
		differenceDir: '3'
  });

  test.equal(instance.metric, 'psnr', 'Metric becomes PeakSignalToNoiseRatio');
  test.equal(instance.style, 'xor', 'Style is xor');
  test.equal(instance.color, 'pink', 'Color is pink');
  test.equal(instance.prevDir, '1', 'Previous directory');
  test.equal(instance.currDir, '2', 'Current directory');
  test.equal(instance.diffDir, '3', 'Difference directory');
});

tape('other options gets set', function (test) {
  test.plan(3);

  var instance = new Jikishin({
		verbose: true,
		suffixes: 'png,jpg,gif',
		whenDone: function () {}
  });

  test.ok(instance.verbose === true, 'Verbosity is boolean true');
  test.deepEqual(instance.suffixes, ['png', 'jpg', 'gif'], 'Suffixes are an array of three items');
  test.equal(typeof instance.whenDone, 'function', 'Callback is a function');
});

tape('wrong type of options get ignored', function (test) {
  test.plan(9);

  var instance = new Jikishin({
		metric: [],
		style: 20,
		color: {},
		previousDir: 100,
		currentDir: true,
		differenceDir: {},
		verbose: 'yes',
		suffixes: false,
		whenDone: 'callback me not'
  });

  test.equal(instance.metric, 'pae', 'Metric is the default');
  test.equal(instance.style, 'tint', 'Style is the default');
  test.equal(instance.color, '#85144b', 'Color is something in hex');
  test.ok(instance.verbose === false, 'Verbosity is boolean false');
  test.deepEqual(instance.suffixes, ['png'], 'Suffixes are an array with one value, png');
  test.equal(instance.prevDir, 'previous', 'Previous directory');
  test.equal(instance.currDir, 'current', 'Current directory');
  test.equal(instance.diffDir, 'difference', 'Difference directory');
  test.equal(instance.whenDone, null, 'Callback is null');
});

tape('metric option must be one of the predefined', function (test) {
  test.plan(1);

  var instance = new Jikishin({
		metric: 'hoplaa'
  });

  test.equal(instance.metric, 'pae', 'Metric is the default');
});

tape('style option must be one of the predefined', function (test) {
  test.plan(1);

  var instance = new Jikishin({
    style: 'hoplaa'
  });

  test.equal(instance.style, 'tint', 'Style is the default');
});

tape('no files found when no matching suffixes', function (test) {
  test.plan(1);

  var instance = new Jikishin({
		previousDir: 'tests/fixtures/prev/',
		suffixes: 'jpg,gif'
  });
	instance._readPrevDir(instance.prevDir);

  test.equal(instance.capturedPrev.length, 0, 'Previous images list is empty');
});

tape('runner should fail when command not found', function (test) {
  test.plan(1);

  var instance = new Jikishin();

  test.throws(instance._runner('not', ['found']));
});

