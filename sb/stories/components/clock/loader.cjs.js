'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-2180555e.js');

/*
 Stencil Client Patch Esm v2.6.0 | MIT Licensed | https://stenciljs.com
 */
const patchEsm = () => {
    return index.promiseResolve();
};

const defineCustomElements = (win, options) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return patchEsm().then(() => {
  return index.bootstrapLazy([["ionx-clock.cjs",[[1,"ionx-clock"]]]], options);
  });
};

exports.defineCustomElements = defineCustomElements;
