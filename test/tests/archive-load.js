const should = require('should');

const aux = require('../aux');

const HBuilderServer = require('../../server');

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

  it('should ok', function () {

    var server = new HBuilderServer({
      rabbitMQURI: aux.rabbitMQURI,
      taskName: 'test-build',
    }, function builderFn(options, vfs, logger) {
      
    });

  });
});