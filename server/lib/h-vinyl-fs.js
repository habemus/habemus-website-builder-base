// native
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const NODE_PATH = require('path');

// third-party
const vinylFs         = require('vinyl-fs');
const rootPathBuilder = require('root-path-builder');

// constants

/**
 * List of options that are allowed for vinylFs.src
 * @type {Array}
 */
const VINYL_FS_SRC_OPTIONS = [
  {
    name: 'base',
    fn: function (value) {
      if (value === '.') {
        return this.root.value();
      } else {
        return this.root.prependTo(value);
      }
    }
  },
  {
    name: 'dot',
    fn: function (value) {
      return value;
    }
  }
];

/**
 * HVFs Constructor
 * @param {String} rootDirPath
 */
function HVFs(rootDirPath) {
  EventEmitter.call(this);

  this.rootDirPath = rootDirPath;
  this.root = rootPathBuilder(rootDirPath);
}
util.inherits(HVFs, EventEmitter);

/**
 * Proxy method to vinyl-fs `src` method
 * @param  {Array|String} patterns
 * @param  {Object} userOptions
 * @return {Vinyl Read Stream}
 */
HVFs.prototype.src = function (patterns, userOptions) {
  userOptions = userOptions || {};

  patterns = Array.isArray(patterns) ? patterns : [patterns];

  patterns = patterns.map((pattern) => {
    return this.root.prependTo(pattern);
  });

  /**
   * Only pass explicitly allowed userOptions
   * to vinylFs
   */
  var allowedOpts = VINYL_FS_SRC_OPTIONS.reduce((res, opt) => {

    var value = userOptions[opt.name];

    if (value) {
      res[opt.name] = opt.fn(value);
    }

    return res;
  }, {});

  return vinylFs.src(patterns, allowedOpts);
};

/**
 * Proxy method to vinyl-fs `dest` method
 * @param  {String} destPath
 * @return {Vinyl Write Stream}
 */
HVFs.prototype.dest = function (destPath) {
  destPath = NODE_PATH.join(this.rootDirPath, destPath);

  // TBD: use root.validatePath(destPath) method once it is implemented
  if (!this.root.isPathWithin(destPath) && destPath !== this.root.value()) {
    throw new Error('invalid path ' + destPath);
  } 

  return vinylFs.dest(destPath);
};

module.exports = HVFs;
