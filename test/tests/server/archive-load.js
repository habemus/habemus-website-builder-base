// native
const fs = require('fs');

// third-party
const should = require('should');

const aux = require('../../aux');

const HBuilderServer = require('../../../server');

describe('HBuilder#archiveLoad(srcOptions)', function () {

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

  it('should load the zip file from the url and unzip it into a temporary directory', function () {

    var server = new HBuilderServer({
      name: 'test-build',
    }, function builderFn(options, vfs, logger) {

    });

    return server.archiveLoad('http://localhost:9000/files/website.zip')
      .then((tmpDir) => {

        (typeof tmpDir.path).should.eql('string');
        (typeof tmpDir.cleanup).should.eql('function');

        Object.keys(tmpDir).length.should.eql(2);

        // check that the files were unzipped
        var contents = fs.readdirSync(tmpDir.path);

        contents.sort();

        contents.should.eql([
          'LICENSE.txt',
          'README.txt',
          'assets',
          'images',
          'index.html',
        ]);
      });

  });

  it('should error if the url provided returns 404', function () {
    var server = new HBuilderServer({
      name: 'test-build',
    }, function builderFn(options, vfs, logger) {

    });

    return server
      .archiveLoad('http://localhost:9000/files/does-not-exist.zip')
      .then(aux.errorExpected, (err) => {
        console.log(err);
      });
  });
});