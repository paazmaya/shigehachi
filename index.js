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

var Ikkyoku = {

  // Defaults
  color: '#85144b',
  metric: 'pae',
  style: 'tint',
  verbose: true,

  // Directories
  prevDir: '',
  currDir: '',
  diffDir: '',

  // List of image files in "previous directory"
  capturedPrev: [],

  readPrevDir: function (dir) {
    var dir = fs.readdirSync(dir);
    this.capturedPrev = dir.filter(function (item) {
      return item.match(/\.png$/);
    });
  },

  // List of commands as arrays ['binary', array arguments]
  commandList: [],

  // Currently iterating index of the commandList
  currentIndex: 0,

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


  createCompareCommand: function (diffPicture, prevPicture, currPicture) {
    console.log('diffPicture ' + diffPicture);
    console.log('prevPicture ' + prevPicture);
    console.log('currPicture ' + currPicture);

    var outputFile = diffPicture.replace('.png', '-' +
      this.color.replace('#', '') + '-' + this.metric +
      '-' + this.style + '.png');

    // http://www.graphicsmagick.org/compare.html
    var compareArgs = [
      'compare',
      '-metric',
      this.metric,
      '-highlight-color',
      '"' + this.color + '"',
      '-highlight-style',
      this.style,
      '-file',
      outputFile,
      prevPicture,
      currPicture
    ];
    this.commandList.push(['gm', compareArgs]);
  },

  /**
   * Actuel function to create the diff images
   * Originating from 2014-01-31
   * https://github.com/stefanjudis/grunt-photobox/blob/master/tasks/lib/photobox.js#L73
   */
  createDiffImages: function () {


    var self = this;

    this.readPrevDir(this.prevDir);

    this.capturedPrev.forEach(function (picture) {

      var prevPicture = self.prevDir + '/' + picture; // exists
      var currPicture = self.currDir + '/' + picture; // maybe exists
      var diffPicture = self.diffDir + '/' + picture.replace('.png', '-difference.png');

      util.puts('started diff for ' + picture);

      var prevPictureExists = fs.existsSync(prevPicture);
      var currentFileExists = fs.existsSync(currPicture);
      util.puts('prevPictureExists: ' + prevPictureExists + ', currentFileExists: ' + currentFileExists);

      if (prevPictureExists && currentFileExists) {

        self.createCompareCommand(diffPicture, prevPicture, currPicture);

        var compositeFile = diffPicture.replace('-difference.png', '-composite.png');

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

        // http://www.imagemagick.org/script/convert.php
        var convertArgs = [
          '-negate',
          diffPicture,
          negateFile
        ];
        self.commandList.push(['convert', convertArgs]);
      }
    }); // forEach

    // Start running the commands one by one.
    self.nextRun();
  }
};

module.exports = Ikkyoku;
