const path = require('path');
const jsonfile = require('jsonfile');
const { User } = require('../models');
const crypto = require('../../../common/crypto');

class Initialization {
  async init() {
    await this.initUsers();
    console.log('Initialization Done');
  }

  async initUsers() {
    const usersPath = path.join(__dirname, './data/users.json');
    const users = await jsonfile.readFileSync(usersPath);
    const actions = [];
    users.forEach((data) => {
      actions.push(
        User.create({
          ...data,
          password: crypto.createHash(data.password)
        })
      );
    });
    await Promise.all(actions);
  }
}

module.exports = new Initialization();
