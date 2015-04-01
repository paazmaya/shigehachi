/**
 * Shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya
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
