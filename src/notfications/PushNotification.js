const _ = require('lodash');
const FCM = require('fcm-node');

const BaseNotification = require('./BaseNotification');
const { firebase } = require('../config').notifications;

class PushNotification extends BaseNotification {
  constructor() {
    super();
    this.fcm = new FCM(firebase.key);
  }

  /**
   * Config params:
   * @param to: array of user tokens or topics to send messages to
   * @param data: Object contains key value pair to be send as payload
   * @param notification: Object contains [title, body] to be sent as push notifications
   * @returns {Promise<void>}
   */
  async send({ to, title, body, data, isSilent }) {
    if (_.isArray(to)) {
      to = [to];
    }

    if (_.isNil(to) || to.length === 0) {
      return;
    }

    const nData = {
      notification: {
        title: title,
        body: body,
        sound: 'default',
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      to: to,
      data: { ...data, isSilent }
    };

    if (isSilent) {
      delete nData.notification;
    }
    console.log(nData.notification.body)
    return new Promise((resolve, reject) => this.fcm.send(nData, (err, response) => (err ? reject(err) : resolve(response))));
  }

  async subscribe(token, channel) {
    return new Promise((resolve, reject) => this.fcm.subscribeToTopic([token], channel, (err, response) => (err ? reject(err) : resolve(response))));
  }

  async unsubscribe(token, channel) {
    return new Promise((resolve, reject) => this.fcm.unsubscribeToTopic([token], channel, (err, response) => (err ? reject(err) : resolve(response))));
  }
}

module.exports = new PushNotification();
