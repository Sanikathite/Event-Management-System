const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendEventConfirmationEmail } = require('../utils/emailService');
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Home Route
router.get('/', async (req, res) => {
    try {
        const upcomingEvents = await Event.find({ completed: false });
        const completedEvents = await Event.find({ completed: true });
        
        // Verify Razorpay key is available
        if (!process.env.RAZORPAY_KEY_ID) {
            console.error('Razorpay key is not configured');
        }
        
        res.render('index', { 
            upcomingEvents, 
            completedEvents,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            error: null
        });
    } catch (error) {
        console.error('Error in home route:', error);
        res.render('index', {
            upcomingEvents: [],
            completedEvents: [],
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            error: 'Error loading events'
        });
    }
});

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Ensure amount is in paise
        const amountInPaise = Math.round(amount); // Amount is already converted to paise in client
        
        if (amountInPaise < 100) { // Minimum amount is ₹1
            return res.status(400).json({ error: 'Amount must be at least ₹1' });
        }

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: 'order_' + Date.now()
        };

        console.log('Creating Razorpay order with options:', options);

        try {
            const order = await razorpay.orders.create(options);
            console.log('Razorpay order created:', order);
            
            if (!order || !order.id) {
                throw new Error('Invalid response from Razorpay');
            }

            // Send response in the format the client expects
            res.json({
                success: true,
                order: order
            });
        } catch (razorpayError) {
            console.error('Razorpay API error:', razorpayError);
            res.status(500).json({ 
                success: false,
                error: 'Error creating Razorpay order',
                details: razorpayError.message
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error while creating order',
            details: error.message
        });
    }
});

// Add Event Route
router.post('/add-event', async (req, res) => {
    try {
        const {
            name,
            description,
            date,
            startTime,
            endTime,
            duration,
            eventType,
            venue,
            onlineLink,
            organizerName,
            organizerEmail,
            contactNumber,
            category,
            tags,
            posterUrl,
            maxParticipants,
            rsvpRequired,
            ratePerHour,
            totalAmount,
            razorpayOrderId,
            razorpayPaymentId
        } = req.body;

        // Create new event
        const newEvent = new Event({
            name,
            description,
            date,
            startTime,
            endTime,
            duration,
            eventType,
            venue,
            onlineLink,
            organizerName,
            organizerEmail,
            contactNumber,
            category,
            tags: tags.split(',').map(tag => tag.trim()),
            posterUrl,
            maxParticipants,
            rsvpRequired: rsvpRequired === 'on',
            ratePerHour,
            totalAmount,
            razorpayOrderId,
            paymentStatus: razorpayPaymentId ? 'Completed' : 'Pending'
        });

        // Save event to database
        await newEvent.save();

        // Send confirmation email
        if (organizerEmail) {
            try {
                await sendEventConfirmationEmail(organizerEmail, newEvent);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Continue with the response even if email fails
            }
        }

        res.json({ success: true, eventId: newEvent._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Add payment verification route
router.post('/verify-payment', async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature 
        } = req.body;

        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            res.json({ 
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            res.status(400).json({ 
                success: false,
                error: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error verifying payment',
            details: error.message
        });
    }
});

module.exports = router;
