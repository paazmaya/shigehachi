/**
 * Shigehachi
 * https://github.com/paazmaya/shigehachi
 *
 * Compare two sets of images and generate difference images
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

import tape from 'tape';

import ensureDirectory from '../../lib/ensure-directory.js';

tape('ensureDirectory - false when already existed', (test) => {
  test.plan(1);

  test.notOk(ensureDirectory(__dirname));
});

tape('ensureDirectory - true when new created', (test) => {
  test.plan(1);

  test.ok(ensureDirectory('tmp/1234'), 'tmp/1234 was created');
});
