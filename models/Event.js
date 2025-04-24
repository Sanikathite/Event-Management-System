const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Basic Information
    name: { type: String, required: true },
    description: { type: String, required: true, maxlength: 500 },
    
    // Date & Time
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // HH:MM format
    endTime: { type: String, required: true }, // HH:MM format
    duration: { type: Number }, // in hours
    
    // Location & Format
    eventType: { 
        type: String, 
        required: true,
        enum: ['Online', 'Offline', 'Hybrid']
    },
    venue: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue'
    },
    onlineLink: { type: String },
    
    // Organizer Details
    organizerName: { type: String, required: true },
    organizerEmail: { type: String, required: true },
    contactNumber: { type: String },
    
    // Categorization
    category: {
        type: String,
        required: true,
        enum: ['Workshop', 'Seminar', 'Competition', 'Cultural', 'Networking', 'Tech Talk', 'Other']
    },
    tags: [{ type: String }],
    posterUrl: { type: String },
    
    // Participation
    maxParticipants: { type: Number },
    
    // Payment
    ratePerHour: { type: Number, default: 100 },
    totalAmount: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    
    // Status
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
