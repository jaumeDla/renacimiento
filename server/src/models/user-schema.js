const mongoose = require('../database/connection')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    amount: { type: Number, required: true, default: 0 },
    verify: { type: Boolean, required: true, default: false },
    createdDate: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('users', userSchema);