/**
 @license
 Copyright (c) 2020 danleyb2. All rights reserved.
 */
'use strict';
const del = require('del');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');
const polymerBuild1 = require('polymer-build');
const polymerBuild2 = require('polymer-build');
const path = require('path');
const vinylFs = require('vinyl-fs');
const streams = require("./node_modules/polymer-build/lib/streams");

// Additional plugins can be used to optimize your source files after splitting.
// Before using each plugin, install with `npm i --save-dev <package-name>`
// const uglify = require('gulp-uglify');
// const cssSlam = require('css-slam').gulp;
// const htmlMinifier = require('gulp-html-minifier');

const polymerJson = require('./polymer.json');

var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {try {step(generator.next(value));} catch (e) {reject(e);}}
    function rejected(value) {try {step(generator['throw'](value));} catch (e) {reject(e);}}
    function step(result) {result.done ? resolve(result.value) : new P(function(resolve) {resolve(result.value);}).then(fulfilled, rejected);}
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

const mainBuildDirectoryName = 'dist';

function buildProject(options, polymerProject) {
  return __awaiter(this, void 0, void 0, function* () {
    const buildName = options.name || 'default';
    // If no name is provided, write directly to the build/ directory.
    // If a build name is provided, write to that subdirectory.
    const buildDirectory = path.join(mainBuildDirectoryName, buildName);

    // console.debug(`"${buildDirectory}": Building with options:`, options);

    console.debug(`"${buildDirectory}": Building with options:`);

    // Fork the two streams to guarentee we are working with clean copies of each
    // file and not sharing object references with other builds.
    const sourcesStream = polymerBuild1.forkStream(polymerProject.sources());
    const depsStream = polymerBuild2.forkStream(polymerProject.dependencies());
    const bundled = !!(options.bundle);
    let buildStream = mergeStream(sourcesStream, depsStream);
    const compiledToES5 = (options.js === undefined) ?
      false :
      options.js.compile === true || options.js.compile === 'es5' ||
      (typeof options.js.compile === 'object' &&
        options.js.compile.target === 'es5');
    if (compiledToES5) {
      buildStream =
        buildStream.pipe(polymerProject.addCustomElementsEs5Adapter());
    }
    if (bundled) {
      const bundlerOptions = {
        rewriteUrlsInTemplates: false,
      };
      if (typeof options.bundle === 'object') {
        Object.assign(bundlerOptions, options.bundle);
      }
      buildStream = buildStream.pipe(polymerProject.bundler(bundlerOptions));
    }
    const htmlSplitter = new polymerBuild1.HtmlSplitter();
    buildStream = streams.pipeStreams([
      buildStream,
      htmlSplitter.split(),
      polymerBuild2.getOptimizeStreams({
        html: options.html,
        css: options.css,
        js: Object.assign({}, options.js, {moduleResolution: polymerProject.config.moduleResolution}),
        entrypointPath: polymerProject.config.entrypoint,
        rootDir: polymerProject.config.root,
      }),
      htmlSplitter.rejoin(),
    ]);
    if (options.insertPrefetchLinks) {
      buildStream = buildStream.pipe(polymerProject.addPrefetchLinks());
    }
    buildStream.once('data', () => {
      console.info(`(${buildName}) Building...`);
    });
    if (options.basePath) {
      let basePath = options.basePath === true ? buildName : options.basePath;
      if (!basePath.startsWith('/')) {
        basePath = '/' + basePath;
      }
      if (!basePath.endsWith('/')) {
        basePath = basePath + '/';
      }
      buildStream = buildStream.pipe(polymerProject.updateBaseTag(basePath));
    }
    if (options.addPushManifest) {
      buildStream = buildStream.pipe(polymerProject.addPushManifest());
    }
    // Finish the build stream by piping it into the final build directory.
    buildStream = buildStream.pipe(vinylFs.dest(buildDirectory));
    // There is nothing left to do, so wait for the build stream to complete.
    yield streams.waitFor(buildStream);

    console.info(`(${buildName}) Build complete!`);
  });
}

function build(done) {
    let presets = polymerJson['builds'];
    const polymerProject = new polymerBuild.PolymerProject(polymerJson);
    const tasks = presets.map(preset => {
      return buildProject(preset, polymerProject);
    });

    // Clean dist directory
    del.sync(['dist/*']);
    return Promise.all([...tasks])

}

gulp.task('build', build);
