# shigehachi (繁八)

> Compare two sets of images and generate difference images

![Mr Shigehachi Sonobe](./logo.png)

[![Ubuntu Build Status](https://paazmaya.semaphoreci.com/badges/shigehachi.svg)](https://paazmaya.semaphoreci.com/projects/shigehachi)
[![Windows build status](https://ci.appveyor.com/api/projects/status/0tj1ycxk27j5ff58/branch/master?svg=true)](https://ci.appveyor.com/project/paazmaya/shigehachi/branch/master)
[![codecov](https://codecov.io/gh/paazmaya/shigehachi/branch/master/graph/badge.svg)](https://codecov.io/gh/paazmaya/shigehachi)
[![dependencies Status](https://david-dm.org/paazmaya/shigehachi/status.svg)](https://david-dm.org/paazmaya/shigehachi)
[![Inline docs](http://inch-ci.org/github/paazmaya/shigehachi.svg?branch=master)](http://inch-ci.org/github/paazmaya/shigehachi)

This tool reads a folder, searching for images and then tries to find matching ones
from another folder. These pairs are compared and an image is created to a third folder,
which visualises the differences of the first two.

## Background for the name

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

The version tested of GraphicMagick is `1.3.34`.

Install the `shigehachi` command line utility globally with [npm](https://www.npmjs.com/).
Elevated privileges might be needed via `sudo`, depending on the platform. In most cases just:

```sh
npm install --global shigehachi
```

Please note that the minimum supported version of [Node.js](https://nodejs.org/en/) is `14.15.0`, which is [the active Long Term Support (LTS) version](https://github.com/nodejs/Release#release-schedule).

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

## Comparison example

By running the following command on two screen captures of
[naginata.fi](https://naginata.fi/en/koryu) that were taken while adjusting paddings:

```sh
shigehachi --current-dir tests/fixtures/curr/website \
 --previous-dir tests/fixtures/prev/website \
 --output-dir tests/expected/website \
 --match '\.(png)$' \
 --metric rmse
```

...would result these three images, in the order of "difference", "negate", and "composite":

[![naginata.fi koryu page difference](./naginata-koryu_thumb.png)](./tests/expected/website/naginata-koryu.png)
[![naginata.fi koryu page negate](./naginata-koryu-negate_thumb.png)](./tests/expected/website/naginata-koryu-negate.png)
[![naginata.fi koryu page composite](./naginata-koryu-composite_thumb.png)](./tests/expected/website/naginata-koryu-composite.png)

The [previous](./tests/fixtures/prev/website/naginata-koryu.png) and
[current](./tests/fixtures/curr/website/naginata-koryu.png) images are available at
the `tests/fixtures` directory.

The file `shigehachi.json` generated to the output directory, looks something similar to this:

```json
{
  "a0db9e2b1dec76cd4964bbac45daa719": {
    "metric": "MeanAbsoluteError",
    "normalized": {
      "red": "0.0135227820",
      "green": "0.0771904810",
      "blue": "0.0779529725",
      "opacity": "0.0982667803",
      "total": "0.0667332540"
    },
    "absolute": {
      "red": "886.2",
      "green": "5058.7",
      "blue": "5108.6",
      "opacity": "6439.9",
      "total": "4373.4"
    },
    "A": "tests/fixtures/prev/website/naginata-koryu.png",
    "B": "tests/fixtures/curr/website/naginata-koryu.png",
    "D": "tests/expected/website/naginata-koryu.png",
    "N": "tests/expected/website/naginata-koryu-negate.png"
  }
}
```

The index hash is made with `md5` algorithm, from the file path string of image A.

## Command line options

The output of `shigehachi --help` pretty much covers all the options:

```sh
shigehachi [options]

  -h, --help                 Help and usage instructions
  -V, --version              Version number, with verbosity also application name
  -v, --verbose              Verbose output, will print which file is currently being processed
  -P, --previous-dir String  Directory in which the previous images are stored - default: previous
  -C, --current-dir String   Directory in which the current images are stored - default: current
  -O, --output-dir String    Directory in which the resulting differentiation images are stored - default: diff-2019-05-15T15-22
  -c, --color String         Color used in the output images, such as #b10dc9 or purple - default: pink
  -m, --metric String        Difference calculation metric - either: mae, mse, pae, psnr, or rmse - default: pae
  -s, --style String         Style in which the differentiation image is created - either: assign, threshold, tint, or xor - default: tint
  -p, --compose String       Composition type used for creating a composite image - either: over, in, out, atop, xor, plus, minus, add, subtract, difference, divide, multiply,
                             bumpmap, copy, copyred, copygreen, copyblue, copyopacity, copycyan, copymagenta, copyyellow, or copyblack - default: difference
  -A, --all-variations       Generate diff image variations for all alternatives of metric and compose options
  -M, --match String         Regular expression for matching and filtering image files - default: \.png$
  -l, --long-diff-name       Include used metric, style and composition options in difference image file names
  -r, --recursive            Recursive search of images in the previous and current directories

Version 7.0.0
```

Be aware of using the `--all-variations` option, since it will execute about 1320 commands per single image comparison pair.

Combining `--version` and `--verbose` (or using `-Vv`) the output will also contain the name
of the application in addition to the version number.

## Using in a Node.js script

Best example of the usage inside another application is inside the script that is used
for the command line interface, `bin/shigehachi.js`.

Installation with [npm](https://www.npmjs.com/):

```sh
npm install --save shigehachi
```

First include this module in your script:

```js
const Shigehachi = require('shigehachi');
```

Define the options, which follow the same convention as the command line options, with the
exception of being camelCased from the long versions. Below is an example of all configuration
options by using their default values:

```js
const options = {
  color: 'pink',
  compose: 'difference',
  currentDir: 'current',
  longDiffName: false,
  match: '\.png$',
  metric: 'pae',
  outputDir: 'diffence',
  previousDir: 'previous',
  recursive: false,
  allVariations: false,
  style: 'tint',
  verbose: false,
  whenDone: null
};
```

Initialise an instance with the above `options` object and call `exec()` method
to generate the images:

```js
const hachi = new Shigehachi(options);
hachi.exec();
```

In addition to the options used for command line, there is also a callback which gets
called when the execution has been done. It gets passed one argument, which is the
collection object of metrics, indexed by the current image file path.

```js
const options = {
  whenDone: function (metrics) {
    console.log(JSON.stringify(metrics, null, '  '));
  }
};

const hachi = new Shigehachi(options);
hachi.exec();
```

The metrics output looks something similar to:

```json
{
  "a0db9e2b1dec76cd4964bbac45daa719": {
    "metric": "MeanAbsoluteError",
    "normalized": {
      "red": "0.0135227820",
      "green": "0.0771904810",
      "blue": "0.0779529725",
      "opacity": "0.0982667803",
      "total": "0.0667332540"
    },
    "absolute": {
      "red": "886.2",
      "green": "5058.7",
      "blue": "5108.6",
      "opacity": "6439.9",
      "total": "4373.4"
    },
    "A": "tests/fixtures/prev/postcss.png",
    "B": "tests/fixtures/curr/postcss.png",
    "D": "tests/fixtures/output/postcss-mae-tint.png",
    "N": "tests/fixtures/output/postcss-mae-tint-negate.png"
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

## Output image files and their naming

It is possible to alter the naming scheme of the images that are produced by the comparison,
negation and composition steps inside the single comparison of two image files.

By default the comparison image will have the same basename as the two which are being compared.
For example `prev/image.jpg` and `curr/image.jpg` will produce `diff/image.png`.
Please note that the generated images are always in [png](http://www.w3.org/TR/PNG/)
format, due to quality requirements.

The negated image, which is generated from the comparison image, will have `-negate` appended
to the basename, before the suffix. For example in the above case it would
be `diff/image-negate.png`.

The third image is a composition of the two images that are being compared. In many cases
this is visually the most useful image, depending of the colours and composition method used.
The basename is appended with `-composite`, thus in the example above `diff/image-composite.png`.

These filenames can be altered via `longDiffName` boolean option. By default it is set to `false`
and the filenames are created as explained above. In case it is set to `true`, the filenames
will also be appended with the used `metric`, `style`, or `color`, depending of the relevance
to the given method.

For example, while following the above example and setting the `longDiffName` to `true`, the
generated three images would become with the default options:

* `diff/image-pae-tint.png`
* `diff/image-pae-tint-negate.png`
* `diff/image-pae-tint-composite-difference.png`

## GraphicMagick is used underneath

The amount of supported metric algorithms, comparison styles and composition types depends
of the GraphicsMagick version. Available options are listed in [the source file](./index.js) and
in the [relevant GraphicsMagick documentation](http://www.graphicsmagick.org/compare.html).

Underneath, the image comparison boils down to a command similar to this:

```sh
gm compare \
 -metric mae \
 -highlight-color purple \
 -highlight-style xor \
 -file tests/fixtures/diff/square-mae-xor.png \
 tests/fixtures/prev/square.png \
 tests/fixtures/curr/square.png
```

Output from the above command with GraphicMagick, would output something like:

```txt
Image Difference (MeanAbsoluteError):
           Normalized    Absolute
          ============  ==========
     Red: 1.0000000000    65535.0
   Green: 0.5019607843    32896.0
    Blue: 0.4980392157    32639.0
   Total: 0.6666666667    43690.0
```

In similar manner, with the different metric types the results vary, namely `mse`, `pae`, `psnr`, and `rmse`:

```txt
Image Difference (MeanSquaredError):
           Normalized    Absolute
          ============  ==========
     Red: 1.0000000000    65535.0
   Green: 0.2519646290    16512.5
    Blue: 0.2480430604    16255.5
   Total: 0.5000025631    32767.7
```

```txt
Image Difference (PeakAbsoluteError):
           Normalized    Absolute
          ============  ==========
     Red: 1.0000000000    65535.0
   Green: 0.5019607843    32896.0
    Blue: 0.4980392157    32639.0
   Total: 1.0000000000    65535.0
```

```txt
Image Difference (PeakSignalToNoiseRatio):
           PSNR
          ======
     Red: 0.00
   Green: 5.99
    Blue: 6.05
   Total: 3.01
```

```txt
Image Difference (RootMeanSquaredError):
           Normalized    Absolute
          ============  ==========
     Red: 1.0000000000    65535.0
   Green: 0.5019607843    32896.0
    Blue: 0.4980392157    32639.0
   Total: 0.7071085936    46340.4
```

## Contributing

["A Beginner's Guide to Open Source: The Best Advice for Making your First Contribution"](http://www.erikaheidi.com/blog/a-beginners-guide-to-open-source-the-best-advice-for-making-your-first-contribution/).

[Also there is a blog post about "45 Github Issues Dos and Don’ts"](https://davidwalsh.name/45-github-issues-dos-donts).

Linting is done with [ESLint](http://eslint.org) and can be executed with `npm run lint`.
There should be no errors appearing after any JavaScript file changes.

Unit tests are written with [`tape`](https://github.com/substack/tape) and can be executed with `npm test`.
Code coverage is inspected with [`nyc`](https://github.com/istanbuljs/nyc) and
can be executed with `npm run coverage` after running `npm test`.
Please make sure it is over 90% at all times.

## Version history

[Changes happening across different versions and upcoming changes are tracked in the `CHANGELOG.md` file.](CHANGELOG.md)

## License

Copyright (c) [Juga Paazmaya](https://paazmaya.fi) <paazmaya@yahoo.com>

Licensed under [the MIT license](./LICENSE).
