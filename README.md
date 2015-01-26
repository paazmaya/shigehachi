# Shigehachi

> Compare two sets of images and generate difference images

[![Build Status](https://semaphoreapp.com/api/v1/projects/6e43cdad-b9fe-47a3-9b6c-97cd354353f3/331218/shields_badge.svg)](https://semaphoreapp.com/paazmaya/shigehachi)
[![Analytics](https://ga-beacon.appspot.com/UA-2643697-15/shigehachi/index)](https://github.com/igrigorik/ga-beacon)

Most likely use case, or the one that "works for me", is comparing
two sets of screen captures from CasperJS browser testing.

The name for the project is honouring the legacy of Mr Sonobe Shigehachi,
who was the 16th head master of [Jikishinkageryu Naginatajutsu](http://naginata.fi/en/koryu).

## Getting started

Make sure you have GraphicMagick installed and available in the `PATH`, before
using `shigehachi`.

Install the command line utility globally with npm, might need `sudo`:

```sh
npm install --global shigehachi
```

Run from the command line, for example the help output:

```sh
shigehachi -h
```

Compare two directories with the default comparison algorithm and store
differentiation images to a folder called `images-diff`:

```sh
shigehachi -p images-previous -c images-current -o images-diff
```

## Command line options

```sh
-h, --help          Help and usage instructions
-V, --version       Version information
-v, --verbose       Verbose output, will print which file is currently being processed
-P, --previous-dir  Directory in which the previous images are
-C, --current-dir   Directory in which the current image are, that should have same names as previous
-O, --output-dir    Directory in which the resulting differentiation images are stored
-c, --color         Color used in the output images, such as \#b10dc9 or purple
-m, --metric        Difference calculation Metric
-s, --style         Style in which the diff image is created
```

Combining `--version` and `--verbose`, the output will also contain the version
information of the GraphicMagick found in the system, if any.

## Application programming interface

**Don't know yet if ever going to exist...**

```js
var shigehachi = require('shigehachi');

shigehachi.color = 'pink';
shigehachi.diff();
```

## License

Licensed under the MIT license.

## Release history

* v1.0.0 (2015-0x-xx)
    - Project initiated and script imported from `nanbudo.fi` test script collection
    - Automated tests via Semaphore

