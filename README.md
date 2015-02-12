# Shigehachi

> Compare two sets of images and generate difference images

![Mr Shigehachi Sonobe](./logo.png)

[![Build Status](https://semaphoreapp.com/api/v1/projects/6e43cdad-b9fe-47a3-9b6c-97cd354353f3/331218/shields_badge.svg)](https://semaphoreapp.com/paazmaya/shigehachi)
[![Analytics](https://ga-beacon.appspot.com/UA-2643697-15/shigehachi/index?flat)](https://github.com/igrigorik/ga-beacon)
[![Dependency Status](https://www.versioneye.com/user/projects/54db51cec1bbbda0130002eb/badge.svg?style=flat)](https://www.versioneye.com/user/projects/54db51cec1bbbda0130002eb)

Most likely use case, or the one that "works for me", is comparing
two sets of screen captures from CasperJS browser testing.

The name for the project is honouring the legacy of Mr Sonobe Shigehachi,
who was the 16th head master of [Jikishinkageryu Naginatajutsu](http://naginata.fi/en/koryu).

## Getting started

Make sure you have GraphicMagick installed and available in the `PATH`, before
using `shigehachi`. This can be tested by running for example:

```sh
gm version
```

Install the command line utility globally with npm, might need `sudo`:

```sh
npm install --global shigehachi
```

Run from the command line, for example getting the help output:

```sh
shigehachi -h
```

Compare two directories with the default comparison algorithm and store
differentiation images to a folder called `images-diff`:

```sh
shigehachi -P images-previous -C images-current -O images-diff
```

The tests of this project are using the following command:

```sh
node bin/shigehachi.js -C tests/fixtures/curr -P tests/fixtures/prev -O tmp
```

## Command line options

```sh
-h, --help          Help and usage instructions
-V, --version       Version number, with verbosity also application name
-v, --verbose       Verbose output, will print which file is currently being processed
-P, --previous-dir  Directory in which the previous images are
-C, --current-dir   Directory in which the current image are, that should have same names as previous
-O, --output-dir    Directory in which the resulting differentiation images are stored
-c, --color         Color used in the output images, such as \#b10dc9 or purple
-m, --metric        Difference calculation Metric
-s, --style         Style in which the diff image is created
```

Combining `--version` and `--verbose` (or using `-Vv`) the output will also contain the name
of the application in addition to the version number.

## Application programming interface

Best example of the usage inside another application is inside the script that is used
for the command line interface, `bin/shigehachi.js`.

First include this module in your script:

```js
var Jikishin = require('shigehachi');
```

Defined the options, which follow the same convention as the command line options, with the
exception of being camelcased from the long versions:

```js
var options = {
  differenceDir: ''
};
```

Initialise an instance with the above `options` object and call `createDiffImages()` method
to generate the images:

```js
var kage = new Jikishin(options);
kage.createDiffImages();
```

## Contributing

[Please refer to a GitHub blog post on how to create somewhat perfect pull request.](https://github.com/blog/1943-how-to-write-the-perfect-pull-request "How to write the perfect pull request")

## License

Copyright (c) [Juga Paazmaya](http://paazmaya.com)

Licensed under [the MIT license](./LICENSE).

## Release history

* v1.0.0 (2015-0x-xx)
    - Project initiated and script imported from `nanbudo.fi` test script collection
    - Automated tests via Semaphore

