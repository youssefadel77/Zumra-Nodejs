const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const DB_RETRIES = 30;
const DB_WAIT_TIME = 2000;

class Database {
  constructor() {
    this._initialized = false;
    this._connection = undefined;
    this._retries = 0;
  }

  /**
   * Register all models in ./models directory
   * Note: Does not work recursively
   * @private
   */
  async _registerPlugins() {
    await new Promise((resolve, reject) => {
      const pluginsDir = 'plugins';
      const dir = path.join(__dirname, pluginsDir);
      fs.readdir(dir, (err, files) => {
        if (err) {
          return reject(err);
        }

        for (let i = 0; i < files.length; i += 1) {
          const plugin = require(path.join(dir, files[i]));
          mongoose.plugin(plugin);
        }

        resolve();
      });
    });
  }

  async _registerModels() {
    require('./models/user');
    require('./models/voucher');
  }

  async _connect(uri, options) {
    try {
      await new Promise((resolve, reject) => {
        mongoose.connect(uri, options).then(
          () => resolve(),
          (err) => reject(err)
        );
      });
      // Only apply index & configurations first time
      const collections = await this.getCollections();
      if (collections && collections.length === 0) {
        await this.initializePreConfig();
        await this.ensureIndexes();
      }
    } catch (err) {
      if (this._retries >= DB_RETRIES) {
        console.log('Waiting timeout');
        throw err;
      }
      this._retries += 1;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(`Waiting for database, Reason: ${err.message}`);
          resolve(this._connect(uri, options));
        }, DB_WAIT_TIME);
      });
    }
  }

  async initialize(dbConfig) {
    if (this._initialized) {
      return;
    }

    // Register plugins
    await this._registerPlugins();

    // Register models
    await this._registerModels();

    // Connect to mongodb
    this._config = dbConfig;
    const uri = dbConfig.url;
    console.log(uri);
    const options = {
      autoIndex: false, // Don't build indexes "Production"
      poolSize: 10, // Maintain up to 10 socket connections
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    };

    await this._connect(uri, options);

    this._initialized = true;
    this._connection = mongoose.connection;
  }

  get isInitialized() {
    return this._initialized;
  }

  get connection() {
    return this._connection;
  }

  async close() {
    return new Promise((resolve) => {
      this._connection.close(() => {
        resolve();
      });
    });
  }

  async getCollections() {
    try {
      const { connections } = mongoose;
      if (connections && connections.length > 0) {
        const { db } = connections[0];
        const collections = await db.listCollections().toArray();
        return collections;
      }

      return undefined;
    } catch (err) {
      return undefined;
    }
  }

  async ensureIndexes() {
    const { models } = mongoose;
    const promises = [];
    for (const model in models) {
      promises.push(models[model].createIndexes());
    }

    await Promise.all(promises);
  }

  async initializePreConfig() {
    await require('./init').init();
  }
}

module.exports = new Database();
