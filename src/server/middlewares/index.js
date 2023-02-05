const koaBody = require('koa-body');
const compress = require('koa-compress');
const cors = require('@koa/cors');

// Routes
const routes = require('./routes');

// Request middlewares
const { logger, requestInterceptors } = require('./request');
// Response middlewares
const { error, notFound, responseInterceptors } = require('./response');

const authentication = require('./authentication');

const middlewares = [error(), compress(), logger({ enabled: true }), cors(), koaBody(), requestInterceptors(), authentication(), routes(), responseInterceptors(), notFound()];

module.exports = middlewares;
