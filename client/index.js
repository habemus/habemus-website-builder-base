// native
const util = require('util');

// third-party
const HWorkerClient = require('h-worker/client');

function HBuilderClient(options) {
  HWorkerClient.call(this, options);
}
util.inherits(HBuilderClient, HWorkerClient);

module.exports = HBuilderClient;
