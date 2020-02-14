/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

/* eslint-disable func-names, handle-callback-err, max-len */

const fs = require('fs'),
  path = require('path'),
  {
    execFile
  } = require('child_process');

const tape = require('tape');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

tape('cli - should output version number', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-V'], null, function (err, stdout) {
    test.equals(stdout.trim(), pkg.version, 'Version is the same as in package.json');
  });

});

tape('cli - should complain when package.json is gone', (test) => {
  test.plan(1);

  const original = 'package.json',
    temporary = 'cabbage';

  fs.renameSync(original, temporary);
  execFile('node', [pkg.bin, '-V'], null, function (err, stdout, stderr) {
    test.ok(stderr.trim().indexOf('Could not read/parse "package.json", quite strange...') === 0);
    fs.renameSync(temporary, original);
  });

});

tape('cli - should output name and version number when verbose version', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-Vv'], null, function (err, stdout) {
    test.equals(stdout.trim(), pkg.name + ' v' + pkg.version, 'Name and version is the same as in package.json');
  });

});

tape('cli - help output', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '--help'], null, function (err, stdout) {
    const count = (stdout.match(/differentiation/gu) || []).length;
    test.equals(count, 2, 'Word "differentiation" is found several times');
  });

});

tape('cli - does not allow to use wrong metric', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-m', 'hoplaa'], null, function (err, stdout, stderr) {
    test.ok(stderr.indexOf('psnr,') !== -1, 'Metric options listed');
  });

});

tape('cli - does not allow to use wrong style', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-s', 'hoplaa'], null, function (err, stdout, stderr) {
    test.ok(stderr.indexOf('threshold,') !== -1, 'Style options listed');
  });

});

tape('cli - does not allow to use wrong compose', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-p', 'hoplaa'], null, function (err, stdout, stderr) {
    test.ok(stderr.indexOf('copymagenta,') !== -1, 'Compose options listed');
  });

});

tape('cli - should fail when previous directory does not exist', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-P', 'not-around-here'], null, function (err, stdout, stderr) {
    test.equals(stderr.trim(), 'Sorry but the previously created images directory should exist', 'Error message');
  });

});

tape('cli - should fail when current directory does not exist', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-P', 'tests/expected', '-C', 'not-around-here'], null, function (err, stdout, stderr) {
    test.equals(stderr.trim(), 'Sorry but the currently created images directory should exist', 'Error message');
  });

});

tape('cli - succesfull execution', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-P', 'tests/fixtures', '-C', 'tests/expected', '-O', 'tmp/1'], null, function (err, stdout) {
    test.equals(stdout.trim(), '', 'There is no output coming');
  });

});

tape('cli - succesfull execution that writes success message', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-v', '-P', 'tests/fixtures', '-C', 'tests/expected', '-O', 'tmp/2'], null, function (err, stdout) {
    test.ok(stdout.trim().indexOf('Found total of 0 image files') === 0, 'There is output coming');
  });

});
