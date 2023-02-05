module.exports = (schema, options) => {
  this._getDateNow = () => {
    const now = Date.now();
    return now;
  };

  const opts = options || {};

  if (!schema.paths._id) {
    return;
  }

  // Options
  const fields = {};
  const createdAt = opts.createdAt || 'created_at';
  const updatedAt = opts.updatedAt || 'updated_at';

  // Add paths to schema if not present
  if (!schema.paths[createdAt]) {
    fields[createdAt] = { type: Date, default: this._getDateNow };
    fields[updatedAt] = { type: Date, default: this._getDateNow };
  }

  schema.add(fields);

  // Update the modified timestamp on save
  schema.pre('save', function (next) {
    // if (this.isNew) {
    //     this[updatedAt] = _getDateNow();
    //     this[createdAt] = _getDateNow();
    // }

    if (this.parent) {
      return next();
    }

    this[updatedAt] = Date.now();
    next();
  });
};
