const error = require('./error');
const notFound = require('./notFound');
const responseInterceptors = require('./interceptors');

module.exports = {
  error,
  notFound,
  responseInterceptors
};
