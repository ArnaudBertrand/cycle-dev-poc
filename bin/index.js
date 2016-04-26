#!/usr/bin/env node
var server = require('../lib/server');

server.start(process.argv.slice(2));
