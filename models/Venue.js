const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Workshop', 'Seminar', 'Competition', 'Cultural', 'Networking', 'Tech Talk', 'Other']
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    capacity: {
        type: Number,
        required: true
    },
    facilities: [String],
    images: [String],
    contactPerson: {
        name: String,
        email: String,
        phone: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    ratePerHour: {
        type: Number,
        required: true
    },
    description: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Venue', venueSchema); 