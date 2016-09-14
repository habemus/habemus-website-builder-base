// native
const fs = require('fs');
const assert = require('assert');

// third-party
const should = require('should');
const Bluebird = require('bluebird');
const gulpAutoprefixer = require('gulp-autoprefixer');

const aux = require('../../aux');

const HBuilderServer = require('../../../server');

describe('HBuilder#workerFn(data, logger)', function () {

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

  it('should require data.src property', function () {

    var server = new HBuilderServer({
      rabbitMQURI: aux.rabbitMQURI,
      taskName: 'test-build',
    }, function builderFn(options, vfs, logger) {});

    return server.workerFn({
      // src: 'http://localhost:9000/files/website.zip',
      dest: {
        url: 'http://localhost:9000/uploads',
        method: 'POST',
        field: 'file',
      },
    })
    .then(aux.errorExpected, (err) => {
      err.name.should.eql('InvalidOption');
      err.option.should.eql('data.src');
    });
  });

  it('should require data.dest property', function () {

    var server = new HBuilderServer({
      rabbitMQURI: aux.rabbitMQURI,
      taskName: 'test-build',
    }, function builderFn(options, vfs, logger) {});

    return server.workerFn({
      src: 'http://localhost:9000/files/website.zip',
      // dest: {
      //   url: 'http://localhost:9000/uploads',
      //   method: 'POST',
      //   field: 'file',
      // },
    })
    .then(aux.errorExpected, (err) => {
      err.name.should.eql('InvalidOption');
      err.option.should.eql('data.dest');
    });
  });

  it('should execute the load, build and store steps', function () {

    var ERROR_LOG_COUNT = 0;

    var server = new HBuilderServer({
      rabbitMQURI: aux.rabbitMQURI,
      taskName: 'test-build',
    }, function builderFn(options, vfs, logger) {

      // check that the options are passed to the
      // builderFn
      options.test.should.eql('test option');

      return new Bluebird((resolve, reject) => {

        vfs.src('**/*.css')
          .pipe(gulpAutoprefixer())
          .pipe(vfs.dest('.'))
          .on('end', resolve)
          .on('error', reject);

      });

    });

    var mockLogger = {
      log: function () {},
      info: function () {},
      warn: function () {},
      error: function () {
        ERROR_LOG_COUNT += 1;
      },
    };

    return server
      .workerFn({
        src: 'http://localhost:9000/files/website.zip',
        dest: {
          url: 'http://localhost:9000/uploads',
          method: 'POST',
          field: 'file',
        },
        options: {
          test: 'test option',
        }
      })
      .then(() => {
        // build results should have been uploaded
        fs.readdirSync(aux.tmpPath).length.should.eql(1);

        // check that no errors happened
        ERROR_LOG_COUNT.should.eql(0);
      });
  });
});