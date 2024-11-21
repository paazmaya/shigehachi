# Version history for shigehachi (繁八)

This changelog covers the version history and possible upcoming changes.
It follows the guidance from https://keepachangelog.com/en/1.0.0/.

## Unreleased

- Minimum supported Node.js version lifted from `14.15.0` to `22.11.0`

## `v8.0.0` (2023-06-06)

- Minimum supported Node.js version lifted from `10.13.0` to `14.15.0`
- Test against Node.js v18
- It's all ES Modules now

## `v7.0.2` (2021-05-23)
- Update `fs-extra` to keep sanity with dependencies

## `v7.0.1` (2021-02-16)
- Run tests also against Node.js version 14. Now versions 10 (Semaphore), 12 (AppVeyor), and 14 (Semaphore) of Node.js are covered
- Migrate to version 2 of Semaphore CI

## `v7.0.0` (2020-02-14)
- Minimum Node.js version lifted from `8.11.1` to `10.13.0`
- The metrics file called `shigehachi.json` contains more information, in order to serve [`hideo`](https://github.com/paazmaya/hideo) better
- Default image file matching for `png` files is now case insensitive

## `v6.0.0` (2019-05-15)
- Added command option `--all-variations` for generating diff images with all possible metric, compose, and style alternatives. This will run about 1320 GraphicMagick commands more per image comparison pair
- Command line tool now saves the metrics data as `shigehachi.json` in the `output-dir` directory
- Metrics data file structure slightly changed, make sure to have a look

## `v5.0.2` (2019-05-13)
- `npm-shrinkwrap.json` was not included in the published package

## `v5.0.1` (2019-05-10)
- Use [`npm-shrinkwrap.json`](https://docs.npmjs.com/files/shrinkwrap.json) for locking the working set of 3rd party dependencies
- There were dependencies with `npm audit` issues, which were fixed by simply updating 3rd party dependencies

## `v5.0.0` (2018-09-16)
- Minimum Node.js version lifted from `4.2.0` to `8.11.1`
- Dependencies up to :tophat: since it has been two years since previous release

## `v4.0.6` (2016-09-01)
- Remove the quotes around filenames added in `v4.0.5` as they were trouble like :neckbeard: to :princess:

## `v4.0.5` (2016-09-01)
- Color was no applied when supposed to due to additional quotes #10
- Fixing documentation to match implementation
- While programmatically used, the default color was not `pink`. Now it is, as documented

## `v4.0.4` (2016-08-08)
- Move code coverage from `instanbul` to `nyc`
- Test also in Windows, at [AppVeyor](https://ci.appveyor.com/project/paazmaya/shigehachi)
- Lint lib folder contents too

## `v4.0.3` (2016-07-11)
- There is always room for dependency updates
- Functionality split in to different files

## `v4.0.2` (2016-03-22)
- Plenty of dependency updates

## `v4.0.1` (2015-12-04)
- Using ES2015 arrow functions to reduce the amount of lines in code
- Code coverage results via codecov #7

## `v4.0.0` (2015-11-16)
- Switch to `optionator` from `nomnom` #6
- `differenceDir` changed to `outputDir`
- Using `stderr` instead of `stdout` for error cases, `console.error()` versus `console.log()`

## `v3.0.0` (2015-10-29)
- Require Long Term Supported Node.js version, namely minimum of `4.2.0`
- Start to use ES2015 features and enable ESLint to validate against those

## `v2.3.0` (2015-04-27)
- Output image file naming verbosity via `longDiffName` option

## `v2.2.0` (2015-04-14)
- Enforce all resulting images as PNG, instead of accidentally just assuming so
- Output examples

## `v2.1.0` (2015-04-14)
- Clean up command creation since they all are subcommands of `gm`
- Fixed the image file order for `gm composite` command, changed image first
- New option `compose` for setting composition type,
  defaults to `'difference'` which was hard coded previously

## `v2.0.1` (2015-04-14)
- ImageMagick was still used in two of the three commands

## `v2.0.0` (2015-04-08)
- Ability to filter files with regular expression matching
- Removed suffix option, in favour of matching with a regular expression

## `v1.1.0` (2015-04-07)
- Added the ability to filter directories recursively
- Make sure all target directories exist

## `v1.0.0` (2015-04-02)
- Project initiated and script imported from `nanbudo.fi` test script collection
- Dependency status via Versioneye #3
- Unit tests with tape and code coverage with covert #4
- Automated tests via Semaphore #2
