'use strict';

var replaceStream = require('replacestream');
var fs = require('fs');
var path = require('path');
//var exec = require('child_process').exec;
var stream = require('stream');
var generateServices = require('loopback-sdk-angular').services;
var app = require('./server/server');

var client = generateServices(app, {
  ngModuleName: 'lbServices',
  apiUrl: 'http://localhost:3003/api',
});

var fout = fs.createWriteStream(path.join(__dirname, '..', 'roma-web', 'src', 'app', 'models', 'lb-services.generated.js'));

var s = new stream.Readable();
s._read = function noop() {}; // redundant? see update below
s.push(client);

// fs.createReadStream(path.join(__dirname, 'lbs-a.js'))
s
  .pipe(replaceStream(/factory\(\n(\s+)\"(\w+)/g, 'factory(\n$1"LB$2'))
  .pipe(fout);

s.push(null);
