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

  it('should require builderFn to be defined', function () {
    assert.throws(function () {
      var server = new HBuilderServer({
        name: 'test-build',
      }, undefined);
    }, HBuilderServer.errors.InvalidOption);
  });
});