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

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '0.0667332540', 'Normalised value for total recorded correctly');
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

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '0.0554032469', 'Normalised value for total recorded correctly');
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

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '1.0000000000', 'Normalised value for total recorded correctly');
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

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '12.56', 'Normalised value for total recorded correctly');
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

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '0.2353789431', 'Normalised value for total recorded correctly');
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

  test.ok(res.hasOwnProperty('normalised'), 'normalised key found');
  test.equal(res.normalised.total, '0.2393789431', 'Normalised value for total from the latter values');
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
