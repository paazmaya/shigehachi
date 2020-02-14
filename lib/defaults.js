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


module.exports = {
  METRIC: 'pae', // PeakAbsoluteError
  STYLE: 'tint',
  COMPOSE: 'difference',
  COLOR: 'pink',

  PREVIOUS_DIR: 'previous',
  CURRENT_DIR: 'current',
  OUTPUT_DIR: 'difference',

  MATCH_PNG: /\.png$/ui
};
