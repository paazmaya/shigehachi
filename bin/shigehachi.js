/**
 * Shigehachi
 *
 * Diff generation for two sets of images
 */

'use strict';

var fs = require('fs'),
  util = require('util');

var Jikishin = require('../index'),
  nomnom = require('nomnom');

var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

var dateString = (function (now) {
  now.setTime(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  var s = now.toISOString().replace(/[\s:]/g, '-').split('-');
  s.pop();
  return s.join('-');
}(new Date()));

var opts = nomnom.script('shigehachi')
   .option('version', {
      abbr: 'V',
      flag: true,
      help: 'Version information',
      callback: function() {
         return pkg.version;
      }
   })
   .option('verbose', {
      abbr: 'v',
      flag: true,
      help: 'Verbose output, will print which file is currently being processed'
   })
   .option('prevDir', {
      abbr: 'P',
      full: 'previous-dir',
      type: 'string',
      help: 'Directory in which the resulting differentiation images are stored'
   })
   .option('currDir', {
      abbr: 'C',
      full: 'current-dir',
      type: 'string',
      help: 'Directory in which the resulting differentiation images are stored'
   })
   .option('diffDir', {
      abbr: 'O',
      full: 'output-dir',
      type: 'string',
      default: './diff-' + dateString,
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
      choices: [
        'mae', // MeanAbsoluteError
        'mse', // MeanSquaredError
        'pae', // PeakAbsoluteError
        'psnr', // PeakSignalToNoiseRatio
        'rmse' // RootMeanSquaredError
      ],
      help: 'Difference calculation metric'
   })
   .option('style', {
      abbr: 's',
      type: 'string',
      default: 'tint',
      choices: [
        'assign',
        'threshold',
        'tint',
        'xor'
      ],
      help: 'Style in which the diff image is created'
   })
   .parse();


if (!fs.existsSync(opts.prevDir)) {
  util.puts('Sorry but the previously created image directory should exist, which was given as a first parameter');
  process.exit();
}

if (!fs.existsSync(opts.currDir)) {
  util.puts('Sorry but the currently created image directory should exist, which was given as a second parameter');
  process.exit();
}

if (!fs.existsSync(opts.diffDir)) {
  util.puts('Output directory did not exist, thus creating it');
  fs.mkdirSync(opts.diffDir);
}

var kage = new Jikishin(opts);
kage.createDiffImages();

