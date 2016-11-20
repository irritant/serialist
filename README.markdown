# Serialist

Serialist is a live coding environment that uses [serialist-grammar](https://github.com/irritant/serialist-grammar) to generate MIDI messages. It requires a MIDI synthesizer (software or hardware) and does not generate any sound on its own.

# Usage Tips &amp; Tricks

* Review the [serialist-grammar](https://github.com/irritant/serialist-grammar#syntax) syntax.
* Select a MIDI output port from the _MIDI Port_ menu (OS X users can use the _IAC Driver Bus_ to route MIDI messages to a DAW or software synth).
* Type your command in the _Command_ field and click the check button or press `Shift-Alt-Return` to evaluate and play.
* Control playback with the transport buttons or by pressing `Shift-Alt-Space` (play/pause) or `Shift-Ctrl-Alt-Space` (stop).
* Modify your command and re-evaluate as often as you like. Your previous commands will be listed in the _History_ field.
* You can use the [serialist-grammar identifier syntax](https://github.com/irritant/serialist-grammar#identifiers) to specify a MIDI channel for each voice. If you don't specify a MIDI channel, Serialist will send on channel 1.
* After playing, save any interesting commands by copying them from the _History_ field to a text file on your computer.

# Contributing

All new branches should be based off of the `develop` branch.

## Prerequisites

* [npm](https://www.npmjs.com)
* [Webpack](https://webpack.github.io)
* [Gulp](http://gulpjs.com)

## Toolchain & Configuration

This project uses webpack with [babel](https://babeljs.io) to transpile ES6 JavaScript and gulp to compile CSS and manage webpack configurations for development and production.

### Configuration Files

* `gulpfile.js`: gulp configuration
* `webpack.dev.config.js`: webpack configuration for development (unminified)
* `webpack.prod.config.js`: webpack configuration for production

## JavaScript

* Use ES6 module syntax for better compatibility with babel
* Linting is performed by [ESLint](http://eslint.org) using rules defined in `.eslintrc`

## CSS

* This project uses [postcss](http://postcss.org) with [cssnext](http://cssnext.io)
    * `@import` statements are supported via `postcss-import`
    * CSS variables are supported via `postcss-simple-vars`
    * CSS mixins are supported via `postcss-mixins`
* Linting is performed by [stylelint](http://stylelint.io) using rules defined in `.stylelintrc`

## Install

### Install Dependencies

    $ cd /path/to/project
    $ npm install

## Compile

The `dist` files are not included in the repo on the `develop` branch, so you need to compile by running `gulp` after installation.

    $ cd /path/to/project
    $ gulp

Compiling with the default `gulp` task is slow, so use `gulp watch` during development. This will run `webpack` with the `--watch` option, which recompiles JavaScript as you make changes and drastically reduces compilation times. `gulp watch` will also watch and compile CSS files.

    $ cd /path/to/project
    $ gulp && gulp watch

## Build for Production

The default `gulp` and `gulp watch` tasks compile React for development and debugging and do not minify JavaScript or CSS. Run `gulp production` to compile React for production and minify all assets. This should only be run on the `master` branch.

    $ cd /path/to/project
    $ gulp production
