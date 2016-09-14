// native
const url = require('url');
const fs = require('fs');

// third-party
const zipUtil = require('zip-util');
const tmp     = require('tmp');
const Bluebird = require('bluebird');
const request = require('request');

var strategies = {
  'zip+http': function (storeOptions, dirPath) {

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

          if (err) {
            reject(err);
          } else {
            resolve(httpResponse);
          }
        });
      });
    });
  }
};

module.exports = function archiveStore(storeOptions, dirPath) {
  return strategies['zip+http'](storeOptions, dirPath);
};
  