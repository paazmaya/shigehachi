# Shigehachi

> Compare two sets of images

[![Build Status](https://semaphoreapp.com/api/v1/projects/6e43cdad-b9fe-47a3-9b6c-97cd354353f3/331218/badge.png)](https://semaphoreapp.com/paazmaya/shigehachi)
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
differentiation images to a folder called `diff`:

```sh
shigehachi -o diff images-previous images-current
```

## Command line options

```sh
-h, --help          Help and usage instructions
-V, --version       Version information
-o --output-dir     Directory in which the resulting differentiation images are stored
-c --diff-color     Color used in the output images
-v, --verbose       Verbose output, will print which file is currently being processed
-a --algorithm      Difference calculation algorithm
```


Combining `--version` and `--verbose`, the output will also contain the version
information of the GraphicMagick found in the system, if any.

## Application programming interface

**Don't know yet if ever going to exist...**

```js
var shigehachi = require('shigehachi');

shigehachi.options.diffColor = 'pink';
shigehachi.diff();
```

## License

Licensed under the MIT license.

## Release history

* v1.0.0 (2015-0x-xx)
    - Project initiated and script imported from `nanbudo.fi` test script collection
    - Automated tests via Semaphore

