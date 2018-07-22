/*globals process, module */
/*
 * Create and export configuration variables
 *
 */

// Container for all environments
var envs = {};

// Staging (default) environment
envs.staging = {
  'httpPort' : 7070,
  'httpsPort' : 7071,
  'envName' : 'staging'
};

// Production environment
envs.production = {
  'httpPort' : 8080,
  'httpsPort' : 8081,
  'envName' : 'production'
};

// Determine which environment was passed as a command-line argument
var currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var envToExport = typeof (envs[currentEnv]) === 'object' ? envs[currentEnv] : envs.staging;

// Export the module
module.exports = envToExport;
