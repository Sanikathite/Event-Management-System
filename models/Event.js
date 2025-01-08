const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // 24-hour format
    description: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Event', eventSchema);
