const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  age: { type: Number, required: true, min: 1 },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  fitnessGoal: { type: String, required: true, trim: true },
});

module.exports = mongoose.model('User', userSchema);
