// native
const util = require('util');

// third-party
const HWorkerServer = require('h-worker/server');

const errors = HWorkerServer.errors;

/**
 * Server constructor function
 * 
 * @param {Object} options
 * @param {Function} builderFn
 */
function HBuilderServer(options, builderFn) {
  
  HWorkerServer.call(this, options);

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
util.inherits(HBuilderServer, HWorkerServer);

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
