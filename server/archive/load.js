// native
const url = require('url');

// third-party
const zipUtil = require('zip-util');
const tmp     = require('tmp');
const Bluebird = require('bluebird');

/**
 * Promisified create tmp dir
 * @return {Bluebird}
 */
var _createTmpDir = function (options) {
  return new Bluebird((resolve, reject) => {
    tmp.dir(options, (err, dirPath, cleanupCallback) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          path: dirPath,
          cleanup: cleanupCallback,
        });
      }
    });
  });
};

/**
 * Hash of src loading strategies
 * @type {Object}
 */
var strategies = {
  'zip+http': function (url, dirPath) {

    if (typeof url !== 'string') {
      throw new Error('srcUrl MUST be a string');
    }
    
    return zipUtil.zipDownload(url, dirPath);
  }
};

/**
 * Retrieves the most appropriate strategy given the loadOptions
 * argument.
 * @param  {*} loadOptions
 * @return {Function}
 */
function getStrategy(loadOptions) {
  // TBD: implement dsl for retrieving loading strategy

  var strategyName = 'zip+http';

  return strategies[strategyName];
}

/**
 * Export a function that returns the actual loading function
 * @param  {Object} loadOptions
 * @return {Function}
 */
module.exports = function archiveLoad(loadOptions) {

  var loadFn = getStrategy(loadOptions);

  // variable to store reference
  // to the tmp dir
  var _tmpDir;

  return _createTmpDir({ unsafeCleanup: true })
    .then((tmpDir) => {

      _tmpDir = tmpDir;

      return loadFn(loadOptions, tmpDir.path);
    })
    .then(() => {
      return _tmpDir;
    });

};
