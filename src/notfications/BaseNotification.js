class BaseNotification {
  async send(config) {
    throw new Error('Not Implemented');
  }
}

module.exports = BaseNotification;
