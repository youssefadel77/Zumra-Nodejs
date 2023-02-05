const usersEvents = require('../services/subscribers/users');

class Events {
  initialize() {
    usersEvents.initialize();
  }
}

module.exports = new Events();
