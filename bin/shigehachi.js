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

import fs from 'node:fs';
import path from 'node:path';

import optionator from 'optionator';

import Shigehachi from '../index.js';
import types from '../lib/types.js';
import defaults from '../lib/defaults.js';

/* import pkg from '../package.json' assert { type: 'json' };*/
const packageFile = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

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
      default: defaults.PREVIOUS_DIR,
      description: 'Directory in which the previous images are stored'
    },
    {
      option: 'current-dir',
      alias: 'C',
      type: 'String',
      default: defaults.CURRENT_DIR,
      description: 'Directory in which the current images are stored'
    },
    {
      option: 'output-dir',
      alias: 'O',
      type: 'String',
      default: defaults.OUTPUT_DIR,
      description: 'Directory in which the resulting differentiation images are stored'
    },
    {
      option: 'color',
      alias: 'c',
      type: 'String',
      default: defaults.COLOR,
      description: 'Color used in the output images, such as #b10dc9 or purple'
    },
    {
      option: 'metric',
      alias: 'm',
      type: 'String',
      default: defaults.METRIC,
      enum: types.METRIC,
      description: 'Difference calculation metric'
    },
    {
      option: 'style',
      alias: 's',
      type: 'String',
      default: defaults.STYLE,
      enum: types.STYLE,
      description: 'Style in which the differentiation image is created'
    },
    {
      option: 'compose',
      alias: 'p',
      type: 'String',
      default: defaults.COMPOSE,
      enum: types.COMPOSE,
      description: 'Composition type used for creating a composite image'
    },
    {
      option: 'all-variations',
      alias: 'A',
      type: 'Boolean',
      default: false,
      description: 'Generate diff image variations for all alternatives of metric and compose options'
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
opts.whenDone = (metrics) => {
  const output = JSON.stringify(metrics, null, '  ');
  const filepath = path.join(opts.outputDir, pkg.name + '.json');
  fs.writeFileSync(filepath, output, 'utf8');
  if (opts.verbose) {
    console.log('Comparison finished. Result saved to: ' + filepath);
  }
};

const hachi = new Shigehachi(opts);
hachi.exec();
