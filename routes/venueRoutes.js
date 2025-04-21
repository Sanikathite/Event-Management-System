const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');

// Get all venues
router.get('/', async (req, res) => {
    try {
        const venues = await Venue.find();
        res.json(venues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get single venue by ID
router.get('/:id', async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.json(venue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get venues by category
router.get('/category/:category', async (req, res) => {
    try {
        const venues = await Venue.find({ 
            category: req.params.category,
            isAvailable: true 
        });
        res.json(venues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Add new venue
router.post('/', async (req, res) => {
    try {
        const newVenue = new Venue(req.body);
        await newVenue.save();
        res.json(newVenue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Update venue
router.put('/:id', async (req, res) => {
    try {
        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(venue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Delete venue
router.delete('/:id', async (req, res) => {
    try {
        await Venue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Venue deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router; 