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

import fs from 'fs';
import {
  execFile
} from 'child_process';

import tape from 'tape';

/* import pkg from '../package.json' assert { type: 'json' };*/
const packageFile = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

tape('cli - should output version number', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-V'], null, function (err, stdout) {
    test.equals(stdout.trim(), pkg.version, 'Version is the same as in package.json');
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
    test.ok(stderr.trim().indexOf('Sorry but the previously created images directory should exist') !== -1, 'Error message');
  });

});

tape('cli - should fail when current directory does not exist', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-P', 'tests/expected', '-C', 'not-around-here'], null, function (err, stdout, stderr) {
    test.ok(stderr.trim().indexOf('Sorry but the currently created images directory should exist') !== -1, 'Error message');
  });

});

tape('cli - successful execution', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-P', 'tests/fixtures', '-C', 'tests/expected', '-O', 'tmp/1'], null, function (err, stdout) {
    test.equals(stdout.trim(), '', 'There is no output coming');
  });

});

tape('cli - successful execution that writes success message', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-v', '-P', 'tests/fixtures', '-C', 'tests/expected', '-O', 'tmp/2'], null, function (err, stdout) {
    test.ok(stdout.trim().indexOf('Found total of 0 image files') === 0, 'There is output coming');
  });

});
