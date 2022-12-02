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

import tape from 'tape';

import allVariationCommands from '../../lib/all-variation-commands.js';

tape('allVariationCommands - huge number of commands', (test) => {
  test.plan(1);

  const list = allVariationCommands('postcss.png', 'prev/postcss.png', 'curr/postcss.png', {
    outputDir: 'diff',
    color: 'pink',
    style: 'xor'
  });

  test.equal(list.length, 1320, 'Many commands');

});
