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
  parseMetrics = require('../../lib/parse-metrics');

tape('parseMetrics - gm output gets parsed meaningfully with mae metric', function (test) {
  test.plan(4);

  const output = [
    'Image Difference (MeanAbsoluteError):',
    '           Normalized    Absolute',
    '          ============  ==========',
    '     Red: 0.0135227820        3.4',
    '   Green: 0.0771904810       19.7',
    '    Blue: 0.0779529725       19.9',
    ' Opacity: 0.0982667803       25.1',
    '   Total: 0.0667332540       17.0'
  ].join('\n');

  const res = parseMetrics(output);

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'MeanAbsoluteError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalized'), 'normalized key found');
  test.equal(res.normalized.total, '0.0667332540', 'Normalized value for total recorded correctly');
});

tape('parseMetrics - gm output gets parsed meaningfully with mse metric', function (test) {
  test.plan(4);

  const output = [
    'Image Difference (MeanSquaredError):',
    '           Normalized    Absolute',
    '          ============  ==========',
    '     Red: 0.0016826921        0.4',
    '   Green: 0.0602237442       15.4',
    '    Blue: 0.0614397708       15.7',
    ' Opacity: 0.0982667803       25.1',
    '   Total: 0.0554032469       14.1'
  ].join('\n');

  const res = parseMetrics(output);

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'MeanSquaredError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalized'), 'normalized key found');
  test.equal(res.normalized.total, '0.0554032469', 'Normalized value for total recorded correctly');
});

tape('parseMetrics - gm output gets parsed meaningfully with pae metric', function (test) {
  test.plan(4);

  const output = [
    'Image Difference (PeakAbsoluteError):',
    '           Normalized    Absolute ',
    '          ============  ==========',
    '     Red: 0.1411764706       36.0 ',
    '   Green: 0.7882352941      201.0 ',
    '    Blue: 0.7960784314      203.0 ',
    ' Opacity: 1.0000000000      255.0 ',
    '   Total: 1.0000000000      255.0 '
  ].join('\n');

  const res = parseMetrics(output);

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'PeakAbsoluteError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalized'), 'normalized key found');
  test.equal(res.normalized.total, '1.0000000000', 'Normalized value for total recorded correctly');
});

tape('parseMetrics - gm output gets parsed meaningfully with psnr metric', function (test) {
  test.plan(4);

  const output = [
    'Image Difference (PeakSignalToNoiseRatio):',
    '           PSNR',
    '          ======',
    '     Red: 27.74',
    '   Green: 12.20',
    '    Blue: 12.12',
    ' Opacity: 10.08',
    '   Total: 12.56'
  ].join('\n');

  const res = parseMetrics(output);

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'PeakSignalToNoiseRatio', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('psnr'), 'psnr key found');
  test.equal(res.psnr.total, '12.56', 'psnr value for total recorded correctly');
});

tape('parseMetrics - gm output gets parsed meaningfully with rmse metric', function (test) {
  test.plan(4);

  const output = [
    'Image Difference (RootMeanSquaredError):',
    '           Normalized    Absolute',
    '          ============  ==========',
    '     Red: 0.0410206303       10.5',
    '   Green: 0.2454052653       62.6',
    '    Blue: 0.2478704718       63.2',
    ' Opacity: 0.3134753265       79.9',
    '   Total: 0.2353789431       60.0'
  ].join('\n');

  const res = parseMetrics(output);

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'RootMeanSquaredError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalized'), 'normalized key found');
  test.equal(res.normalized.total, '0.2353789431', 'Normalized value for total recorded correctly');
});

tape('parseMetrics - gm output gets parsed meaningfully with double output from rmse metric', function (test) {
  test.plan(4);

  const output = [
    'Image Difference (RootMeanSquaredError):',
    '           Normalized    Absolute',
    '          ============  ==========',
    '     Red: 0.0410206303       10.5',
    '   Green: 0.2454052653       62.6',
    '    Blue: 0.2478704718       63.2',
    ' Opacity: 0.3134753265       79.9',
    '   Total: 0.2353789431       60.0',
    '',
    'Image Difference (RootMeanSquaredError):',
    '           Normalized    Absolute',
    '          ============  ==========',
    '     Red: 0.0420206303       10.5',
    '   Green: 0.2464052653       62.6',
    '    Blue: 0.2488704718       63.2',
    ' Opacity: 0.3144753265       79.9',
    '   Total: 0.2393789431       60.0'
  ].join('\n');

  const res = parseMetrics(output);

  test.ok(res.hasOwnProperty('metric'), 'metric key found');
  test.equal(res.metric, 'RootMeanSquaredError', 'Metric recorded correctly');

  test.ok(res.hasOwnProperty('normalized'), 'normalized key found');
  test.equal(res.normalized.total, '0.2393789431', 'Normalized value for total from the latter values');
});

tape('parseMetrics - gm output with messy things', function (test) {
  test.plan(1);

  const output = [
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

  const res = parseMetrics(output);

  test.notOk(res, 'Results were not generated');
});




tape('parseMetrics - MeanSquaredError', function (test) {
  test.plan(5);

  const output = `Image Difference (MeanSquaredError):
           Normalized    Absolute
          ============  ==========
     Red: 0.0016826921      110.3
   Green: 0.0602237442     3946.8
    Blue: 0.0614397708     4026.5
 Opacity: 0.0982667803     6439.9
   Total: 0.0554032469     3630.9
`;
  const res = parseMetrics(output);

  test.equal(res.metric, 'MeanSquaredError', 'Metric recorded correctly');
  test.ok(res.hasOwnProperty('normalized'), 'normalized key found');
  test.ok(res.hasOwnProperty('absolute'), 'absolute key found');
  test.equal(res.normalized.blue, '0.0614397708', 'Normalized value for blue is correct');
  test.equal(res.absolute.green, '3946.8', 'Absolute value for green is correct');
});

tape('parseMetrics - PeakAbsoluteError', function (test) {
  test.plan(5);

  const output = `Image Difference (PeakAbsoluteError):
           Normalized    Absolute
          ============  ==========
     Red: 0.1411764706     9252.0
   Green: 0.7882352941    51657.0
    Blue: 0.7960784314    52171.0
 Opacity: 1.0000000000    65535.0
   Total: 1.0000000000    65535.0
`;
  const res = parseMetrics(output);

  test.equal(res.metric, 'PeakAbsoluteError', 'Metric recorded correctly');
  test.ok(res.hasOwnProperty('normalized'), 'normalized key found');
  test.ok(res.hasOwnProperty('absolute'), 'absolute key found');
  test.equal(res.normalized.blue, '0.7960784314', 'Normalized value for blue is correct');
  test.equal(res.absolute.green, '51657.0', 'Absolute value for green is correct');
});

tape('parseMetrics - PeakSignalToNoiseRatio', function (test) {
  test.plan(5);

  const output = `Image Difference (PeakSignalToNoiseRatio):
           PSNR
          ======
     Red: 27.74
   Green: 12.20
    Blue: 12.12
 Opacity: 10.08
   Total: 12.56
`;
  const res = parseMetrics(output);

  test.equal(res.metric, 'PeakSignalToNoiseRatio', 'Metric recorded correctly');
  test.ok(res.hasOwnProperty('psnr'), 'psnr key found');
  test.notOk(res.hasOwnProperty('absolute'), 'absolute key not found');
  test.equal(res.psnr.blue, '12.12', 'psnr value for blue is correct');
  test.equal(res.psnr.green, '12.20', 'psnr value for green is correct');
});

tape('parseMetrics - RootMeanSquaredError', function (test) {
  test.plan(5);

  const output = `Image Difference (RootMeanSquaredError):
           Normalized    Absolute
          ============  ==========
     Red: 0.0410206303     2688.3
   Green: 0.2454052653    16082.6
    Blue: 0.2478704718    16244.2
 Opacity: 0.3134753265    20543.6
   Total: 0.2353789431    15425.6
`;
  const res = parseMetrics(output);

  test.equal(res.metric, 'RootMeanSquaredError', 'Metric recorded correctly');
  test.ok(res.hasOwnProperty('normalized'), 'normalized key found');
  test.ok(res.hasOwnProperty('absolute'), 'absolute key found');
  test.equal(res.normalized.blue, '0.2478704718', 'Normalized value for blue is correct');
  test.equal(res.absolute.green, '16082.6', 'Absolute value for green is correct');
});
