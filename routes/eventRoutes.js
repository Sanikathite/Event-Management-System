const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Home Route
router.get('/', async (req, res) => {
    try {
        const upcomingEvents = await Event.find({ completed: false });
        const completedEvents = await Event.find({ completed: true });
        res.render('index', { upcomingEvents, completedEvents });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Add Event Route
router.post('/add-event', async (req, res) => {
    const { name, date, time, description } = req.body;
    const newEvent = new Event({ name, date, time, description });
    await newEvent.save();
    res.redirect('/');
});

module.exports = router;
