const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true,
    unique: true
  },
  password: {
    type: String
  },
});


module.exports = mongoose.model('User', userSchema);
