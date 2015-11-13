#!/usr/bin/env node

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

const fs = require('fs'),
  path = require('path');

const optionator = require('optionator');
const Jikishin = require('../index');

var dateString = (function dateString(now) {
  now.setTime(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  var s = now.toISOString().replace(/[\s:]/g, '-').split('-');
  s.pop();
  return s.join('-');
})(new Date());

var optsParser = optionator({
  prepend: 'shigehachi [options]',
  append: 'Version ',
  options: [
    {
      option: 'version',
      alias: 'V',
      type: 'Boolean',
      default: false,
      description: 'Version number, with verbosity also application name',
      example: '-vV'
    },
    {
      option: 'verbose',
      alias: 'v',
      type: 'Boolean',
      default: false,
      description: 'Verbose output, will print which file is currently being processed'
    },
    {
      option: 'previous-dir',
      alias: 'P',
      type: 'String',
      default: 'previous',
      description: 'Directory in which the previous images are stored'
    },
    {
      option: 'current-dir',
      alias: 'C',
      type: 'String',
      default: 'current',
      description: 'Directory in which the current images are stored'
    },
    {
      option: 'output-dir',
      alias: 'O',
      type: 'String',
      default: 'diff-' + dateString,
      description: 'Directory in which the resulting differentiation images are stored'
    },
    {
      option: 'color',
      alias: 'c',
      type: 'String',
      default: 'pink',
      description: 'Color used in the output images, such as \#b10dc9 or purple'
    },
    {
      option: 'metric',
      alias: 'm',
      type: 'String',
      default: 'pae',
      enum: Jikishin.prototype.metricTypes,
      description: 'Difference calculation metric'
    },
    {
      option: 'style',
      alias: 's',
      type: 'String',
      default: 'tint',
      enum: Jikishin.prototype.styleTypes,
      description: 'Style in which the differentiation image is created'
    },
    {
      option: 'compose',
      alias: 'p',
      type: 'String',
      default: 'difference',
      enum: Jikishin.prototype.composeTypes,
      description: 'Composition type used for creating a composite image'
    },
    {
      option: 'match',
      alias: 'M',
      type: 'String',
      default: '\\.png$',
      description: 'Regular expression for matching and filtering image files'
    },
    {
      option: 'long-diff-name',
      alias: 'l',
      type: 'Boolean',
      default: false,
      description: 'Include used metric, style and composition options in difference image file names'
    },
    {
      option: 'recursive',
      alias: 'r',
      type: 'Boolean',
      default: false,
      description: 'Recursive search of images in the previous and current directories'
    }
  ]
});

var opts;

try {
  opts = optsParser.parse(process.argv);
}
catch (error) {
  console.error(error.message);
  process.exit();
}

if (opts.version) {
  var json = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8');
  var pkg = JSON.parse(json);
  console.log((opts.verbose ? pkg.name + ' v' : '') + pkg.version);
  process.exit();
}

if (!fs.existsSync(opts.previousDir)) {
  console.log('Sorry but the previously created images directory should exist');
  process.exit();
}

if (!fs.existsSync(opts.currentDir)) {
  console.log('Sorry but the currently created images directory should exist');
  process.exit();
}

/**
 * Example of using finished callback
 * @param {Object} metrics Data of the comparison with numbers normalised
 * @returns {void}
 */
var _whenDone = function whenDone(metrics) {
  if (opts.verbose) {
    console.log('Comparison finished. Result metrics:');
  }
  console.log(JSON.stringify(metrics, null, '  '));
};
opts.whenDone = _whenDone;

var kage = new Jikishin(opts);
kage.exec();
