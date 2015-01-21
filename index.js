/**
 * Shigehachi
 *
 * Diff generation for two sets of images
 */

'use strict';

var fs = require('fs'),
  path = require('path'),
  execFile = require('child_process').execFile,
  util = require('util');

// Skip 'node' and 'index.js' 
var args = process.argv.splice(2);

util.puts(util.inspect(args));
if (args.length < 2) {
  util.puts('Sorry but there seems to be missing required parameters, such as directories for comparison');
  process.exit();
}

var dateString = (function (now) {
  now.setTime(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  var s = now.toISOString().replace(/[\s:]/g, '-').split('-');
  s.pop();
  return s.join('-');
}(new Date()));

var prevDir = args[0];
var currDir = args[1];
var diffDir = args[2] || '/diff-' + dateString;

if (!fs.existsSync(diffDir)) {
  fs.mkdirSync(diffDir);
}

var capturedPrev = []; // List of image files

var dir = fs.readdirSync(prevDir);
capturedPrev = dir.filter(function (item) {
  return item.match(/\.png$/);
});

var Ikkyoku = {

  // All images grouped by the original in arrays
  imageSets: [],

  // List of commands as arrays ['binary', array arguments]
  commandList: [],

  // Currently iterating index of the commandList
  currentIndex: 0,

  // List of thumbnails
  imageThumbnails: [],

  // Thumbnail square size
  thumbSize: 200,

  // Regular expressions, test at http://regex101.com
  regExpResults: /^Image Difference\s+\((\w+)\):[\s|\w|=]+\s+(((\w+):\s+([\d\.\w]*)\s*(\d+\.\d+)?\s+)+)$/gmi,

  runner: function (bin, args) {
    console.log('runner: ' + bin + ' ' + args.join(' '));
    var self = this;
    execFile(bin, args, null, function childCallback (err, stdout, stderr) {
      console.log(err);
      console.log(stdout);
      console.log(stderr);

      //var matches = regExpResults.exec(stdout);
      //console.dir(matches);

      self.nextRun();
    });
  },

  nextRun: function () {
    if (this.currentIndex === this.commandList.length) {
      return;
    }
    var command = this.commandList[this.currentIndex++];
    this.runner(command[0], command[1]);
  },

  metrics: [
    //'mae', // MeanAbsoluteError
    //'mse', // MeanSquaredError
    'pae' // PeakAbsoluteError
    //'psnr', // PeakSignalToNoiseRatio
    //'rmse' // RootMeanSquaredError
  ],

  styles: [
    //'assign',
    // 'threshold',
    'tint',
    'xor'
  ],

  /**
   * Actuel function to create the diff images
   * Originating from 2014-01-31
   * https://github.com/stefanjudis/grunt-photobox/blob/master/tasks/lib/photobox.js#L73
   */
  createDiffImages: function () {

    // http://clrs.cc/
    var colors = [
      //'#ff851b', //orange
      //'#01ff70', //lime
      '#85144b', //maroon
      '#b10dc9' //purple
    ];

    var self = this;

    capturedPrev.forEach(function (picture) {

      var prevPicture = prevDir + '/' + picture; // exists
      var currPicture = currDir + '/' + picture; // maybe exists
      var diffPicture = diffDir + '/' + picture.replace('.png', '-difference.png');

      util.puts('started diff for ' + picture);

      var prevPictureExists = fs.existsSync(prevPicture);
      var currentFileExists = fs.existsSync(currPicture);
      util.puts('prevPictureExists: ' + prevPictureExists + ', currentFileExists: ' + currentFileExists);

      if (prevPictureExists && currentFileExists) {

        var images = []; // all images created in this iteration
        images.push(prevPicture);
        images.push(currPicture);

        colors.forEach(function (color) {
          console.log('color ' + color);

          self.styles.forEach(function (style) {
            console.log('style ' + style);

            self.metrics.forEach(function (metric) {
              console.log('metric ' + metric);

              var outputFile = diffPicture.replace('.png', '-' +
                color.replace('#', '') + '-' + metric + '-' + style + '.png');
              images.push(outputFile);

              // http://www.graphicsmagick.org/compare.html
              var compareArgs = [
                'compare',
                '-metric',
                metric,
                '-highlight-color',
                '"' + color + '"',
                '-highlight-style',
                style,
                '-file',
                outputFile,
                prevPicture,
                currPicture
              ];
              self.commandList.push(['gm', compareArgs]);

            });
          });
        });


        var compositeFile = diffPicture.replace('-difference.png', '-composite.png');
        images.push(compositeFile);

        // http://www.imagemagick.org/script/composite.php
        var compositeArgs = [
          prevPicture,
          currPicture,
          '-compose',
          'difference',
          compositeFile
        ];
        self.commandList.push(['composite', compositeArgs]);

        var negateFile = diffPicture.replace('-difference.png', '-negate.png');
        images.push(negateFile);

        // http://www.imagemagick.org/script/convert.php
        var convertArgs = [
          '-negate',
          diffPicture,
          negateFile
        ];
        self.commandList.push(['convert', convertArgs]);

        // Add command for creating thumbnails.
        images.forEach(self.createThumbCommand, self);

        self.imageSets.push(images);
      }
    }); // forEach

    // Start running the commands one by one.
    self.nextRun();
  }
};

Ikkyoku.createDiffImages();
