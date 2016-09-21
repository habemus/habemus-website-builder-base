// native
const fs   = require('fs');
const path = require('path');

// third-party
const should = require('should');

const aux = require('../../aux');

const HBuilderServer = require('../../../server');

describe('HBuilder#archiveStore(destOptions)', function () {

  var ASSETS;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  it('should create a zip archive of a directory and send it to the given host', function () {

    var server = new HBuilderServer({
      name: 'test-build',
    }, function builderFn(options, vfs, logger) {

    });

    return server.archiveStore({
      url: 'http://localhost:9000/uploads',
      method: 'POST',
      field: 'file',
    }, path.join(aux.fixturesPath, 'website'))
    .then(() => {
      // check that the file was uploaded
      fs.readdirSync(aux.tmpPath).length.should.eql(1);
    });

  });

  it('should error if the upload fails', function () {
    var server = new HBuilderServer({
      name: 'test-build',
    }, function builderFn(options, vfs, logger) {

    });

    return server.archiveStore({
      url: 'http://localhost:9000/wrong-upload-path',
      method: 'POST',
      field: 'file',
    }, path.join(aux.fixturesPath, 'website'))
    .then(aux.errorExpected, (err) => {
      // ok
    });
  });
});