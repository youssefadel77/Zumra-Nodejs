require('dotenv').config();
const { api, mongoDB } = require('./src/config');
const { mongo } = require('./src/database');
const Server = require('./src/server');

const instance = new Server({
  name: api.name,
  port: api.port,
  onStart: async () => {
    await mongo.initialize(mongoDB);
  },
  onStarted: async () => {

  },
  onEnd: async () => {
    await mongo.close();
  }
});

instance.start();
