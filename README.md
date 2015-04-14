# Shigehachi (繁八)

> Compare two sets of images and generate difference images

![Mr Shigehachi Sonobe](./logo.png)

[![Build Status](https://semaphoreapp.com/api/v1/projects/6e43cdad-b9fe-47a3-9b6c-97cd354353f3/331218/shields_badge.svg)](https://semaphoreapp.com/paazmaya/shigehachi)
[![Analytics](https://ga-beacon.appspot.com/UA-2643697-15/shigehachi/index?flat)](https://github.com/igrigorik/ga-beacon)
[![Dependency Status](https://www.versioneye.com/user/projects/54db51cec1bbbda0130002eb/badge.svg?style=flat)](https://www.versioneye.com/user/projects/54db51cec1bbbda0130002eb)
[![Inline docs](http://inch-ci.org/github/paazmaya/shigehachi.svg?branch=master)](http://inch-ci.org/github/paazmaya/shigehachi)

This tool reads a folder, searching for images and then tries to find matching ones
from another folder. These pairs are compared and an image is created to a third folder,
which visualises the differences of the first two.

The name of the project is for honouring the legacy of Mr Sonobe Shigehachi (園部 繁八),
who was the 16th head master of
[Jikishinkageryu Naginatajutsu (直心影流薙刀術)](http://naginata.fi/en/koryu),
which is an ancient Japanese martial art, focusing the handling of a long pole like weapon
called naginata.

## Getting started

Make sure you have [GraphicMagick](http://www.graphicsmagick.org/) installed and available
in the `PATH`, before trying to use `shigehachi`. This can be tested by running for example
the following command which should provide plenty of information when successful:

```sh
gm version
```

Install the `sakugawa` command line utility globally with [npm](https://www.npmjs.com/).
Elevated privileges might be needed via `sudo`, depending on the platform. In most cases just:

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

Along with the "compare" image, there will also be a "negate" and "composite" images,
which should help to determine which metric algorithm is the most suitable for the given
comparison.

The tests of this project are using the following command:

```sh
node bin/shigehachi.js -C tests/fixtures/curr -P tests/fixtures/prev -O tmp -M '\.(png|jpg|gif)$'
```

## Command line options

The output of `shigehachi -h` pretty much covers all the options:

```sh
-h, --help          Help and usage instructions
-V, --version       Version number, with verbosity also application name
-v, --verbose       Verbose output, will print which file is currently being processed
-P, --previous-dir  Directory in which the previous images are
-C, --current-dir   Directory in which the current image are, that should have same names as previous
-O, --output-dir    Directory in which the resulting difference images are stored
-c, --color         Color used in the output images, such as \#b10dc9 or purple
-m, --metric        Difference calculation Metric
-s, --style         Style in which the difference images are created
-M, --match         Regular expression for matching files. Default '\.png$'
-r, --recursive     Shall the previous and current directories be recursively searched and matched
```

Combining `--version` and `--verbose` (or using `-Vv`) the output will also contain the name
of the application in addition to the version number.

## Application programming interface

Best example of the usage inside another application is inside the script that is used
for the command line interface, `bin/shigehachi.js`.

Installation with [npm](https://www.npmjs.com/):

```sh
npm install --save shigehachi
```

First include this module in your script:

```js
var Jikishin = require('shigehachi');
```

Defined the options, which follow the same convention as the command line options, with the
exception of being camelCased from the long versions:

```js
var options = {
  differenceDir: ''
};
```

Initialise an instance with the above `options` object and call `exec()` method
to generate the images:

```js
var kage = new Jikishin(options);
kage.exec();
```

In addition to the options used for command line, there is also a callback which gets
called when the execution has been done. It gets passed one argument, which is the
collection object of metrics, indexed by the current image file path.

```js
var opts = {
  whenDone: function (metrics) {
    console.log(JSON.stringify(metrics, null, '  '));
  }
};

var kage = new Jikishin(opts);
kage.exec();
```

The metrics output could look something similar to:

```json
{
  "tests/fixtures/curr/postcss.png": {
    "metric": "PeakAbsoluteError",
    "normalised": {
      "red": "0.1411764706",
      "green": "0.7882352941",
      "blue": "0.7960784314",
      "opacity": "1.0000000000",
      "total": "1.0000000000"
    }
  }
}
```

## File matching

Please note that the command line option and the module configuration expects the `match`
to be a string which is passed to `new RegExp()` constructor.

By default all PNG files are taken in use, with `/\.png$/`, but the reason for having
the option as a regular expression, is to have much more flexibility in which file names
are filtered. Please note that while escaping characters in a string, the backward slash
needs to be escaped as well.

The current implementation does not allow to set any flags for the regular expression,
but the functionality can be added with a suitable pull request.

[More about JavaScript regular expressions.](https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions)

## Contributing

[Please refer to a GitHub blog post on how to create somewhat perfect pull request.](https://github.com/blog/1943-how-to-write-the-perfect-pull-request "How to write the perfect pull request")

Linting is done with [ESLint](http://eslint.org) and can be executed with `npm run lint`.
There should be no errors appearing after any JavaScript file changes.

Unit tests are written with [tape]() and can be executed with `npm test`.

Code coverage is inspected with [covert](https://github.com/substack/covert) and
can be executed with `npm run coverage`. Please make sure it is 100% at all times.


## Version history

* `v2.0.1` (2015-04-14)
    - ImageMagick was still used in two of the three commands
* `v2.0.0` (2015-04-08)
    - Ability to filter files with regular expression matching
    - Removed suffix option, in favour of matching with a regular expression
* `v1.1.0` (2015-04-07)
    - Added the ability to filter directories recursively
    - Make sure all target directories exist
* `v1.0.0` (2015-04-02)
    - Project initiated and script imported from `nanbudo.fi` test script collection
    - Dependency status via Versioneye #3
    - Unit tests with tape and code coverage with covert #4
    - Automated tests via Semaphore #2

## License

Copyright (c) [Juga Paazmaya](http://paazmaya.com)

Licensed under [the MIT license](./LICENSE).

