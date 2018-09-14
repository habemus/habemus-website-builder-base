// native
const util = require('util');

// third-party
const Bluebird = require('bluebird');
const AMQPWorkerClient = require('@habemus/amqp-worker/client');

const errors = AMQPWorkerClient.errors;

/**
 * Builder client constructor
 * @param {Object} options
 */
function HBuilderClient(options) {
  AMQPWorkerClient.call(this, options);
}
util.inherits(HBuilderClient, AMQPWorkerClient);

/**
 * Expose errors as static property
 * @type {Object}
 */
HBuilderClient.errors = errors;

/**
 * Schedules a build workload request
 * It simply formats the message to pass to the schedule method
 * 
 * @param  {String} src     From where files will be loaded
 * @param  {Object} dest    To where files should be sent
 *         - url
 *         - method
 *         - field
 * @param  {Object} options Build options
 * @return {Bluebird}
 */
HBuilderClient.prototype.scheduleBuild = function (src, dest, options) {

  if (!src) {
    return Bluebird.reject(new errors.InvalidOption('src', 'required'));
  }

  if (!dest) {
    return Bluebird.reject(new errors.InvalidOption('dest', 'required'));
  }

  return this.schedule({
    src: src,
    dest: dest,
    options: options
  });
};

module.exports = HBuilderClient;
