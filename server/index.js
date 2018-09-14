// native
const util = require('util');

// third-party
const AMQPWorkerServer = require('@habemus/amqp-worker/server');

const errors = AMQPWorkerServer.errors;

/**
 * Server constructor function
 * 
 * @param {Object} options
 * @param {Function} builderFn
 */
function HBuilderServer(options, builderFn) {
  
  AMQPWorkerServer.call(this, options);

  /**
   * Function to be invoked with the data 
   * for the build.
   * @type {Function}
   */
  this.builderFn = builderFn || this.builderFn;

  if (!this.builderFn) {
    throw new errors.InvalidOption('builderFn', 'required');
  }
}
util.inherits(HBuilderServer, AMQPWorkerServer);

/**
 * Expose errors
 * @type {Object}
 */
HBuilderServer.errors = errors;

/**
 * HBuilderServer's special workerFn.
 * It will load the archive upon which build will be done
 * and invoke the builderFn
 * 
 * @param  {Object} data
 * @param  {Object} logger
 * @return {Bluebird}       
 */
HBuilderServer.prototype.workerFn = require('./worker-fn');

HBuilderServer.prototype.archiveLoad = require('./archive/load');
HBuilderServer.prototype.archiveStore = require('./archive/store');

module.exports = HBuilderServer;
