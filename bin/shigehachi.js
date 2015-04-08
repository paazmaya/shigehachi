#!/usr/bin/env node

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
var nomnom = require('nomnom');
var Jikishin = require('../index');

var dateString = (function dateString(now) {
  now.setTime(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  var s = now.toISOString().replace(/[\s:]/g, '-').split('-');
  s.pop();
  return s.join('-');
})(new Date());

var opts = nomnom.script('shigehachi')
   .option('version', {
      abbr: 'V',
      flag: true,
      help: 'Version number, with verbosity also application name'
   })
   .option('verbose', {
      abbr: 'v',
      flag: true,
      help: 'Verbose output, will print which file is currently being processed'
   })
   .option('previousDir', {
      abbr: 'P',
      full: 'previous-dir',
      type: 'string',
      default: 'previous',
      help: 'Directory in which the previous images are stored'
   })
   .option('currentDir', {
      abbr: 'C',
      full: 'current-dir',
      type: 'string',
      default: 'current',
      help: 'Directory in which the current images are stored'
   })
   .option('differenceDir', {
      abbr: 'O',
      full: 'output-dir',
      type: 'string',
      default: 'diff-' + dateString,
      help: 'Directory in which the resulting differentiation images are stored'
   })
   .option('color', {
      abbr: 'c',
      type: 'string',
      default: 'pink',
      help: 'Color used in the output images, such as \#b10dc9 or purple'
   })
   .option('metric', {
      abbr: 'm',
      type: 'string',
      default: 'pae',
      choices: Jikishin.prototype.metricTypes,
      help: 'Difference calculation metric'
   })
   .option('style', {
      abbr: 's',
      type: 'string',
      default: 'tint',
      choices: Jikishin.prototype.styleTypes,
      help: 'Style in which the differentiation image is created'
   })
   .option('match', {
      abbr: 'M',
      type: 'string',
      default: '\\.png$',
      help: 'Regular expression for matching and filtering image files'
   })
   .option('recursive', {
      abbr: 'r',
      flag: true,
      help: 'Recursive search of images in the previous and current directories'
   })
   .parse();

if (opts.version) {
  var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log((opts.verbose ? pkg.name + ' v' : '') + pkg.version);
  process.exit();
}

if (!fs.existsSync(opts.previousDir)) {
  console.log('Sorry but the previously created image directory should exist');
  process.exit();
}

if (!fs.existsSync(opts.currentDir)) {
  console.log('Sorry but the currently created image directory should exist');
  process.exit();
}

opts.whenDone = function whenDone(metrics) {
  if (opts.verbose) {
    console.log('Comparison finished. Result metrics:');
  }
  console.log(JSON.stringify(metrics, null, '  '));
};

var kage = new Jikishin(opts);
kage.exec();
