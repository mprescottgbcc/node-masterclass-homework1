/*globals require, console */
/*eslint-disable */
/*
 * Primary file for Homework #1 API
 * Submitted by: Meg Prescott
 * Date: 2018-07-21
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');

// Define all the handlers
var handlers = {};

// Sample handler
handlers.hello = function (data, callback) {
  'use strict';
  var bundle = {
    'greeting': 'Welcome to my world!',
    'datetime': Date.now()
  };

  callback(200, bundle);
};

// Not found handler
handlers.notFound = function (data, callback) {
  'use strict';
  callback(404);
};

// Define the request router
var router = {
  'hello' : handlers.hello
};

// All the server logic for both the http and https server
var unifiedServer = function (req, res) {
  'use strict';
  var parsedUrl, path, trimmedPath, queryStringObject, method, headers, decoder, buffer;

  // Parse the url
  parsedUrl = url.parse(req.url, true);

  // Get the path
  path = parsedUrl.pathname;
  trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  queryStringObject = parsedUrl.query;

  // Get the HTTP method
  method = req.method.toUpperCase();

  //Get the headers as an object
  headers = req.headers;

  // Get the payload,if any
  decoder = new StringDecoder('utf-8');
  buffer = '';

  req.on('data', function (data) {
    buffer += decoder.write(data);
  });

  req.on('end', function () {
    buffer += decoder.end();
    var chosenHandler, data;

    // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
    chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof (payload) === 'object' ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("Returning this response: ", statusCode, payloadString);
    });
  });
};


 // Create the HTTP server
var httpServer = http.createServer(function (req, res) {
  'use strict';
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
  'use strict';
  console.log('The HTTP server is running on port ' + config.httpPort);
});

// Create the HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  'use strict';
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
  'use strict';
  console.log('The HTTPS server is running on port ' + config.httpsPort);
});

