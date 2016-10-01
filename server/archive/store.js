// native
const url = require('url');
const fs = require('fs');

// third-party
const zipUtil  = require('zip-util');
const tmp      = require('tmp');
const Bluebird = require('bluebird');
const request  = require('request');
const mime     = require('mime');

/**
 * Auxiliary function that zips a directory to a temporary
 * file and returns an object that describes the temporary file.
 * 
 * @param  {String} dirPath
 * @return {Object}
 *         - path {String}
 *         - cleanup {Function}
 */
function _zip(dirPath) {

  return new Bluebird((resolve, reject) => {

    // TBD: eliminate the need for a temporary file.
    // we are having lots of trouble in creating a
    // write stream using request module.

    tmp.file((err, filePath, fd, cleanupCallback) => {
      var writeStream = fs.createWriteStream(filePath);
      zipUtil.zip(dirPath + '/**/*')
        .pipe(writeStream)
        .on('error', reject)
        .on('finish', () => {
          resolve({
            path: filePath,
            cleanup: cleanupCallback
          });
        });
    });

  });
}

var strategies = {
  /**
   * For form data POST
   * 
   * @param  {Object} storeOptions
   *         - url
   *         - method
   *         - field
   * @param  {String} dirPath
   * @return {Bluebird}
   */
  'zip+post+http': function (storeOptions, dirPath) {

    var url    = storeOptions.url;
    var method = storeOptions.method;
    var field  = storeOptions.field;

    if (!url || !method || !field) {
      throw new Error('url, method and field are required')
    }

    var headers = storeOptions.headers;

    return new Bluebird((resolve, reject) => {

      // TBD: eliminate the need for a temporary file.
      // we are having lots of trouble in creating a
      // write stream using request module.

      tmp.file((err, filePath, fd, cleanupCallback) => {
        var writeStream = fs.createWriteStream(filePath);
        zipUtil.zip(dirPath + '/**/*')
          .pipe(writeStream)
          .on('error', reject)
          .on('finish', () => {
            resolve({
              path: filePath,
              cleanup: cleanupCallback
            });
          });
      });
    })
    .then((tmpFile) => {

      return new Bluebird((resolve, reject) => {
        var formData = {};

        formData[field] = fs.createReadStream(tmpFile.path);

        request.post({
          url: url,
          formData: formData,
        }, function (err, httpResponse, body) {

          tmpFile.cleanup();

          var statusCode = httpResponse.statusCode;
          var statusCodeOk = (statusCode >= 200 && statusCode <= 299);

          if (err) {
            reject(err);
          } else if (!statusCodeOk) {
            reject(httpResponse);
          } else {
            resolve(httpResponse);
          }
        });
      });
    });
  },

  /**
   * Zips the directory's contents and makes a PUT request
   * to the given url
   * 
   * @param  {Object} storeOptions
   *         - method
   *         - url
   * @param  {String} dirPath
   * @return {Bluebird}
   */
  'zip+put+http': function (storeOptions, dirPath) {

    var _tmpFile;

    return _zip(dirPath).then((tmpFile) => {

      _tmpFile = tmpFile;

      return new Bluebird((resolve, reject) => {

        // read the temporary file
        var readStream = fs.createReadStream(tmpFile.path);

        var writeStream = request.put({
          url: storeOptions.url,
          headers: {
            'Content-Type': mime.lookup('.zip'),
          },
        });

        readStream.pipe(writeStream);

        writeStream.on('response', resolve);
        writeStream.on('error', reject);
      });
    })
    .then((result) => {
      // perform cleanup
      _tmpFile.cleanup();

      return result;
    });

  }
};

/**
 * Decides the correct store strategy to be used.
 * 
 * @param  {Object} storeOptions
 * @param  {String} dirPath
 * @return {Bluebird}
 */
module.exports = function archiveStore(storeOptions, dirPath) {

  var method = storeOptions.method || 'PUT';
  method = method.toLowerCase();

  if (method === 'post') {
    return strategies['zip+post+http'](storeOptions, dirPath);
  } else if (method === 'put') {
    return strategies['zip+put+http'](storeOptions, dirPath);
  } else {
    // unsupported
    return Bluebird.reject(
      new Error('unsupported store strategy: ' + method)
    );
  }
};
  