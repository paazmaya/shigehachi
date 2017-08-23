#!/usr/bin/env node

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

const fs = require('fs'),
  path = require('path');

const optionator = require('optionator');

const Jikishin = require('../index'),
  types = require('../lib/types');

const dateString = (function dateString(now) {
  now.setTime(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  const s = now.toISOString().replace(/[\s:]/g, '-').split('-');
  s.pop();

  return s.join('-');
})(new Date());


let pkg;

try {
  const packageJson = fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8');
  pkg = JSON.parse(packageJson);
}
catch (error) {
  console.error('Could not read/parse "package.json", quite strange...');
  console.error(error);
  process.exit(1);
}

const optsParser = optionator({
  prepend: `${pkg.name} [options]`,
  append: `Version ${pkg.version}`,
  options: [
    {
      option: 'help',
      alias: 'h',
      type: 'Boolean',
      default: false,
      description: 'Help and usage instructions'
    },
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
      description: 'Color used in the output images, such as #b10dc9 or purple'
    },
    {
      option: 'metric',
      alias: 'm',
      type: 'String',
      default: 'pae',
      enum: types.metric,
      description: 'Difference calculation metric'
    },
    {
      option: 'style',
      alias: 's',
      type: 'String',
      default: 'tint',
      enum: types.style,
      description: 'Style in which the differentiation image is created'
    },
    {
      option: 'compose',
      alias: 'p',
      type: 'String',
      default: 'difference',
      enum: types.compose,
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

let opts;

try {
  opts = optsParser.parse(process.argv);
}
catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (opts.version) {
  console.log((opts.verbose ?
    pkg.name + ' v' :
    '') + pkg.version);
  process.exit();
}

if (opts.help) {
  console.log(optsParser.generateHelp());
  process.exit();
}

if (!fs.existsSync(opts.previousDir)) {
  console.error('Sorry but the previously created images directory should exist');
  process.exit(1);
}

if (!fs.existsSync(opts.currentDir)) {
  console.error('Sorry but the currently created images directory should exist');
  process.exit(1);
}

/**
 * Example of using finished callback
 * @param {Object} metrics Data of the comparison with numbers normalised
 * @returns {void}
 */
const _whenDone = function _whenDone(metrics) {
  if (opts.verbose) {
    console.log('Comparison finished. Result metrics:');
  }
  console.log(JSON.stringify(metrics, null, '  '));
};
opts.whenDone = _whenDone;


console.log('');
console.log('Options used:');
console.log(opts);
console.log('');

const kage = new Jikishin(opts);
kage.exec();
