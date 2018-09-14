// third-party
const Bluebird = require('bluebird');

// own
const HVinylFs = require('./lib/h-vinyl-fs');

const errors = require('@habemus/amqp-worker/server').errors;

/**
 * Function that executes the whole build process.
 * An overview of what it does:
 * 1. load the files into a temporary filesystem
 * 2. executes the builderFn restricting its access to the temporary filesystem 
 *    (at a best effort basis! This MUST NOT be
 *     counted upon as a standalone security feature)
 * 3. stores the resulting build files somewhere somehow (defined at runtime)
 * 
 * @param  {Object} data
 * @param  {Object} logger
 * @return {Bluebird}
 */
function runBuild(data, logger) {

  var buildSrcOptions  = data.src;
  var buildDestOptions = data.dest;
  var buildOptions     = data.options || {};

  if (!buildSrcOptions) {
    return Bluebird.reject(new errors.InvalidOption('data.src', 'required'));
  }

  if (!buildDestOptions) {
    return Bluebird.reject(new errors.InvalidOption('data.dest', 'required'));
  }

  // variables to hold data that will
  // become availabe as promises get done
  var _tmpDir;
  var _buildReport;

  /**
   * Load the archive upon which building will be run
   */
  return this.archiveLoad(buildSrcOptions)
    .then((tmpDir) => {
      _tmpDir = tmpDir;

      /**
       * Create the hVinylFs instance to be used by
       * the builder function.
       * 
       * @type {HVinylFs}
       */
      var vfs = new HVinylFs(tmpDir.path);

      /**
       * Invoke the builderFn in the context of the
       * hBuilder itself.
       *
       * Pass the options received along with
       * a 'vfs' and a 'logger'
       */
      return this.builderFn(buildOptions, vfs, logger);
    })
    .then((buildReport) => {

      _buildReport = buildReport;

      /**
       * Once the builderFn is done, store the results
       * using the buildDestOptions
       */
      return this.archiveStore(buildDestOptions, _tmpDir.path);
    })
    .then(() => {

      /**
       * Finally cleanup the temporary dir.
       * `tmp` module does not automatically cleanup directories
       * with content in them.
       */
      _tmpDir.cleanup();

      // return the report at the end
      return _buildReport;
    });
}

module.exports = runBuild;
