/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (http://paazmaya.fi)
 * Licensed under the MIT license
 */

'use strict';

var fs = require('fs'),
  execFile = require('child_process').execFile;

var tape = require('tape');

var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')),
  cli = 'bin/shigehachi.js';

tape('cli should output version number', function (test) {
  test.plan(1);

	execFile('node', [cli, '-V'], null, function (err, stdout) {
		test.equals(stdout.trim(), pkg.version, 'Version is the same as in package.json');
  });

});

tape('cli should output name and version number when verbose version', function (test) {
  test.plan(1);

	execFile('node', [cli, '-Vv'], null, function (err, stdout) {
		test.equals(stdout.trim(), pkg.name + ' v' + pkg.version, 'Name and version is the same as in package.json');
  });

});

tape('cli help output', function (test) {
  test.plan(1);

  execFile('node', [cli, '--help'], null, function (err, stdout) {
    var count = (stdout.match(/differentiation/g) || []).length;
    test.equals(count, 2, 'Word "differentiation" is found several times');
  });

});

tape('cli does not allow to use wrong metric', function (test) {
  test.plan(1);

  execFile('node', [cli, '-m', 'hoplaa'], null, function (err, stdout, stderr) {
    test.ok(stderr.indexOf('psnr,') !== -1, 'Metric options listed');
  });

});

tape('cli does not allow to use wrong style', function (test) {
  test.plan(1);

  execFile('node', [cli, '-s', 'hoplaa'], null, function (err, stdout, stderr) {
    test.ok(stderr.indexOf('threshold,') !== -1, 'Style options listed');
  });

});

tape('cli does not allow to use wrong compose', function (test) {
  test.plan(1);

  execFile('node', [cli, '-p', 'hoplaa'], null, function (err, stdout, stderr) {
    test.ok(stderr.indexOf('copymagenta,') !== -1, 'Compose options listed');
  });

});

tape('cli should fail when previous directory does not exist', function (test) {
  test.plan(1);

  execFile('node', [cli, '-P', 'not-around-here'], null, function (err, stdout, stderr) {
    test.equals(stderr.trim(), 'Sorry but the previously created images directory should exist', 'Error message');
  });

});

tape('cli should fail when current directory does not exist', function (test) {
  test.plan(1);

  execFile('node', [cli, '-P', 'tests/expected', '-C', 'not-around-here'], null, function (err, stdout, stderr) {
    test.equals(stderr.trim(), 'Sorry but the currently created images directory should exist', 'Error message');
  });

});


