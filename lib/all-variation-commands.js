/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * A lot has been inspired by https://github.com/stefanjudis/grunt-photobox/
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */



const createCommands = require('./create-commands'),
  types = require('./types'),
  diffImageFilename = require('./diff-image-filename');

module.exports = (picture, prevPicture, currPicture, options) => {
  const commands = [];
  let m, c, s, diffPicture;

  for (const i in types.METRIC) {
    m = types.METRIC[i];
    for (const j in types.COMPOSE) {
      c = types.COMPOSE[j];
      for (const k in types.STYLE) {
        s = types.STYLE[k];

        diffPicture = diffImageFilename(picture, Object.assign(
          {}, options, {
            metric: m,
            compose: c,
            style: s
          })
        );

        commands.push(
          createCommands.compare(diffPicture, prevPicture, currPicture, {
            metric: m,
            color: options.color,
            style: s
          }),
          createCommands.composite(diffPicture, prevPicture, currPicture, {
            longDiffName: true,
            compose: c,
            style: s
          }),
          createCommands.negate(diffPicture)
        );
      }
    }
  }

  return commands;
};
