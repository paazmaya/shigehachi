/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya
 * Licensed under the MIT license
 */

'use strict';

var fs = require('fs');

var tape = require('tape'),
  Jikishin = require('../index');

tape('default options gets set', function (test) {
  test.plan(10);

  var instance = new Jikishin();

  test.equal(instance.metric, 'pae', 'Metric is PeakAbsoluteError');
  test.equal(instance.style, 'tint', 'Style is tint');
  test.equal(instance.color, '#85144b', 'Color is something in hex');
  test.ok(instance.verbose === false, 'Verbosity is boolean false');
  test.ok(instance.recursive === false, 'Recursive is boolean false');
  test.equal(instance.match.source, '\\.png$', 'Matching regular expression');
  test.equal(instance.prevDir, 'previous', 'Previous directory');
  test.equal(instance.currDir, 'current', 'Current directory');
  test.equal(instance.diffDir, 'difference', 'Difference directory');
  test.equal(instance.whenDone, null, 'Callback is null');
});

tape('algorithm and directory options gets set', function (test) {
  test.plan(7);

  var instance = new Jikishin({
		metric: 'psnr',
		style: 'xor',
		color: 'pink',
    recursive: true,
		previousDir: '1',
		currentDir: '2',
		differenceDir: '3'
  });

  test.equal(instance.metric, 'psnr', 'Metric becomes PeakSignalToNoiseRatio');
  test.equal(instance.style, 'xor', 'Style is xor');
  test.equal(instance.color, 'pink', 'Color is pink');
  test.ok(instance.recursive === true, 'Recursive is boolean true');
  test.equal(instance.prevDir, '1', 'Previous directory');
  test.equal(instance.currDir, '2', 'Current directory');
  test.equal(instance.diffDir, '3', 'Difference directory');
});

tape('other options gets set', function (test) {
  test.plan(4);

  var instance = new Jikishin({
		verbose: true,
		match: '\\.(png|jpg|gif)$',
		whenDone: function () {}
  });

  test.ok(instance.verbose === true, 'Verbosity is boolean true');
  test.ok(instance.match instanceof RegExp, 'Match is an Regular Expression');
  test.equal(instance.match.source, '\\.(png|jpg|gif)$', 'Matching regular expression');
  test.equal(typeof instance.whenDone, 'function', 'Callback is a function');
});

tape('wrong type of options get ignored', function (test) {
  test.plan(10);

  var instance = new Jikishin({
		metric: [],
		style: 20,
		color: {},
    recursive: 'yes please',
		previousDir: 100,
		currentDir: true,
		differenceDir: {},
		verbose: 'yes',
		match: false,
		whenDone: 'callback me not'
  });

  test.equal(instance.metric, 'pae', 'Metric is the default');
  test.equal(instance.style, 'tint', 'Style is the default');
  test.equal(instance.color, '#85144b', 'Color is something in hex');
  test.ok(instance.verbose === false, 'Verbosity is boolean false');
  test.ok(instance.recursive === false, 'Recursive is boolean false');
  test.equal(instance.match.source, '\\.png$', 'Matching regular expression');
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

tape('no files found when no matching expression', function (test) {
  test.plan(1);

  var instance = new Jikishin({
		previousDir: 'tests/fixtures/prev/',
    match: '\\.(tiff|bmp)$'
  });
	instance._readPrevDir(instance.prevDir);

  test.equal(instance.capturedPrev.length, 0, 'Previous images list is empty');
});

tape('image files found when matching expression', function (test) {
  test.plan(1);

  var instance = new Jikishin({
    previousDir: 'tests/fixtures/prev/',
    match: '\\.(png|gif)$',
    verbose: true
  });
  instance._readPrevDir(instance.prevDir);

  test.equal(instance.capturedPrev.length, 2, 'Previous images list contains files from base level of the previous dir');
});

tape('runner should fail when command not found', function (test) {
  test.plan(1);

  var instance = new Jikishin();

  test.throws(instance._runner('not', ['found']));
});

tape('runner should call _successRan when command is using gm', function (test) {
  test.plan(2);

  var instance = new Jikishin({
    verbose: true
  });

  instance._successRan = function (stdout, currFile) {
    test.equal(currFile, 'a-file-name', 'Callback called with the given filename');
  };
  instance._nextRun = function () {
    test.pass('Next iteration got called');
  };
  instance._runner('gm', ['version', 'a-file-name']);
});

tape('gm output gets parsed meaningfully with mae metric', function (test) {
  test.plan(5);

  var output = [
    'Image Difference (MeanAbsoluteError):',
    '           Normalized    Absolute',
    '          ============  ==========',
    '     Red: 0.0135227820        3.4',
    '   Green: 0.0771904810       19.7',
    '    Blue: 0.0779529725       19.9',
    ' Opacity: 0.0982667803       25.1',
    '   Total: 0.0667332540       17.0'
  ].join('\n');
  var filepath = 'tests/fixtures/curr/postcss.png';

  var instance = new Jikishin({
    metric: 'mae'
  });
  instance._successRan(output, filepath);

  test.ok(instance.results.hasOwnProperty(filepath), 'Results were added');

  var res = instance.results[filepath];

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'MeanAbsoluteError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '0.0667332540', 'Normalised value for total recorded correctly');
});

tape('gm output gets parsed meaningfully with mse metric', function (test) {
  test.plan(5);

  var output = [
    'Image Difference (MeanSquaredError):',
    '           Normalized    Absolute',
    '          ============  ==========',
    '     Red: 0.0016826921        0.4',
    '   Green: 0.0602237442       15.4',
    '    Blue: 0.0614397708       15.7',
    ' Opacity: 0.0982667803       25.1',
    '   Total: 0.0554032469       14.1'
  ].join('\n');
  var filepath = 'tests/fixtures/curr/postcss.png';

  var instance = new Jikishin({
    metric: 'mse'
  });
  instance._successRan(output, filepath);

  test.ok(instance.results.hasOwnProperty(filepath), 'Results were added');

  var res = instance.results[filepath];

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'MeanSquaredError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '0.0554032469', 'Normalised value for total recorded correctly');
});

tape('gm output gets parsed meaningfully with pae metric', function (test) {
  test.plan(5);

  var output = [
    'Image Difference (PeakAbsoluteError):',
    '           Normalized    Absolute ',
    '          ============  ==========',
    '     Red: 0.1411764706       36.0 ',
    '   Green: 0.7882352941      201.0 ',
    '    Blue: 0.7960784314      203.0 ',
    ' Opacity: 1.0000000000      255.0 ',
    '   Total: 1.0000000000      255.0 '
  ].join('\n');
  var filepath = 'tests/fixtures/curr/postcss.png';

  var instance = new Jikishin({
    metric: 'pae'
  });
  instance._successRan(output, filepath);

  test.ok(instance.results.hasOwnProperty(filepath), 'Results were added');

  var res = instance.results[filepath];

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'PeakAbsoluteError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '1.0000000000', 'Normalised value for total recorded correctly');
});

tape('gm output gets parsed meaningfully with psnr metric', function (test) {
  test.plan(5);

  var output = [
    'Image Difference (PeakSignalToNoiseRatio):',
    '           PSNR',
    '          ======',
    '     Red: 27.74',
    '   Green: 12.20',
    '    Blue: 12.12',
    ' Opacity: 10.08',
    '   Total: 12.56'
  ].join('\n');
  var filepath = 'tests/fixtures/curr/postcss.png';

  var instance = new Jikishin({
    metric: 'psnr'
  });
  instance._successRan(output, filepath);

  test.ok(instance.results.hasOwnProperty(filepath), 'Results were added');

  var res = instance.results[filepath];

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'PeakSignalToNoiseRatio', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '12.56', 'Normalised value for total recorded correctly');
});

tape('gm output gets parsed meaningfully with rmse metric', function (test) {
  test.plan(5);

  var output = [
    'Image Difference (RootMeanSquaredError):',
    '           Normalized    Absolute',
    '          ============  ==========',
    '     Red: 0.0410206303       10.5',
    '   Green: 0.2454052653       62.6',
    '    Blue: 0.2478704718       63.2',
    ' Opacity: 0.3134753265       79.9',
    '   Total: 0.2353789431       60.0'
  ].join('\n');
  var filepath = 'tests/fixtures/curr/postcss.png';

  var instance = new Jikishin({
    metric: 'rmse'
  });
  instance._successRan(output, filepath);

  test.ok(instance.results.hasOwnProperty(filepath), 'Results were added');

  var res = instance.results[filepath];

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'RootMeanSquaredError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '0.2353789431', 'Normalised value for total recorded correctly');
});

tape('gm output with version info', function (test) {
  test.plan(1);

  var output = [
    'GraphicsMagick 1.3.21 2015-02-28 Q8 http://www.GraphicsMagick.org/',
    'Copyright (C) 2002-2014 GraphicsMagick Group.',
    'Additional copyrights and licenses apply to this software.',
    'See http://www.GraphicsMagick.org/www/Copyright.html for details.'
  ].join('\n');
  var filepath = 'tests/fixtures/curr/postcss.png';

  var instance = new Jikishin();
  instance._successRan(output, filepath);

  test.notOk(instance.results.hasOwnProperty(filepath), 'Results were not added');
});

tape('gm output with messy things', function (test) {
  test.plan(1);

  var output = [
    'Image Difference (RootMeanSquaredError):',
    'GraphicsMagick 1.3.21 2015-02-28 Q8 http://www.GraphicsMagick.org/',
    '          ============  ==========',
    '     Red: 0.0410206303       10.5',
    '    Blue: 0.2478704718       63.2',
    'Copyright (C) 2002-2014 GraphicsMagick Group.',
    'Additional copyrights and licenses apply to this software.',
    '          ======',
    '   Green: 12.20',
    'See http://www.GraphicsMagick.org/www/Copyright.html for details.'
  ].join('\n');
  var filepath = 'tests/fixtures/curr/postcss.png';

  var instance = new Jikishin();
  instance._successRan(output, filepath);

  console.log(JSON.stringify(instance.results, null, '  '));

  test.notOk(instance.results.hasOwnProperty(filepath), 'Results were not added');
});

tape('next runner calls runner', function (test) {
  test.plan(2);

  var instance = new Jikishin({
    verbose: true
  });
  instance.commandList = [['gm', ['version']]];

  instance._runner = function (bin, args) {
    test.equal(bin, 'gm', 'Runner got called with gm');
    test.deepEqual(args, ['version'], 'Runner got called with expected arguments');
  };

  instance._nextRun();
});

tape('next runner calls callback when no more command queued', function (test) {
  test.plan(1);

  var instance = new Jikishin({
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

tape('create compare command', function (test) {
  test.plan(2);

  var diff = 'difference.png';
  var prev = 'previous.png';
  var curr = 'current.png';
  var instance = new Jikishin({
    metric: 'psnr',
    style: 'assign',
    color: 'purple'
  });
  test.equal(instance.commandList.length, 0, 'Command list is initially empty');
  instance._createCompareCommand(diff, prev, curr);

  test.deepEqual(instance.commandList, [['gm', [
    'compare',
    '-metric',
    'psnr',
    '-highlight-color',
    '"purple"',
    '-highlight-style',
    'assign',
    '-file',
    diff,
    prev,
    curr
  ]]], 'Command list contains one item with correct arguments');
});

tape('create composite command', function (test) {
  test.plan(2);

  var diff = 'difference.png';
  var prev = 'previous.png';
  var curr = 'current.png';
  var instance = new Jikishin({
    metric: 'psnr',
    style: 'assign',
    color: 'purple'
  });
  test.equal(instance.commandList.length, 0, 'Command list is initially empty');
  instance._createCompositeCommand(diff, prev, curr);

  test.deepEqual(instance.commandList, [['composite', [
    prev,
    curr,
    '-compose',
    'difference',
    'difference-composite.png'
  ]]], 'Command list contains one item with correct arguments');
});

tape('create negate command', function (test) {
  test.plan(2);

  var diff = 'difference.png';
  var instance = new Jikishin({
    metric: 'psnr',
    style: 'assign',
    color: 'purple'
  });
  test.equal(instance.commandList.length, 0, 'Command list is initially empty');
  instance._createNegateCommand(diff);

  test.deepEqual(instance.commandList, [['convert', [
    '-negate',
    diff,
    'difference-negate.png'
  ]]], 'Command list contains one item with correct arguments');
});

tape('exec should not create commands when no files, but call next runner', function (test) {
  test.plan(2);

  var instance = new Jikishin({
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

  var instance = new Jikishin({
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

tape('filter directories recursively', function (test) {
  test.plan(1);

  var instance = new Jikishin({
    recursive: true
  });

  var images = instance._filterDir('tests/fixtures/curr');

  test.equal(images.length, 2, 'Both png images were found');
});

tape('output directory gets created when it does not exist', function (test) {
  test.plan(2);

  var diffDir = 'tmp/diff-' + (new Date).getTime();
  var instance = new Jikishin({
    verbose: true,
    match: 'nothing$',
    differenceDir: diffDir
  });

  test.ok(fs.existsSync(diffDir) === false, 'Output directory does not exist initially');
  instance.exec();
  test.ok(fs.existsSync(diffDir) === true, 'Output directory exists after execution');
});


tape('output directory gets created recursively when it does not exist', function (test) {
  test.plan(2);

  var diffDir = 'tmp/diff-' + (new Date).getTime();
  var instance = new Jikishin({
    verbose: true,
    recursive: true,
    previousDir: 'tests/fixtures/prev',
    currentDir: 'tests/fixtures/curr',
    differenceDir: diffDir
  });

  test.ok(fs.existsSync(diffDir + '/website') === false, 'Output child directory does not exist initially');
  instance.exec();
  test.ok(fs.existsSync(diffDir + '/website') === true, 'Output child directory exists after execution');
});
