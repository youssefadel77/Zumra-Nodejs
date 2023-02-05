const API_NAME = 'GHADAQ';

module.exports = {
  api: {
    name: API_NAME,
    version: '1.0',
    host: 'localhost',
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
    contextStoreName: 'api'
  },
  common: {
    pageSize: 10,
    maxPageSize: 100
  },
  mongoDB: {
    url: process.env.MONGODB_URL
  },
  authentication: {
    issuer: 'website.com',
    key: 'JWT_SECRET_HERE',
    expiration: 604800 // 7 Days
  },
};
