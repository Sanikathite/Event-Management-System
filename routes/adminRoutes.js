const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.clearCookie('adminToken');
        return res.redirect('/admin/login');
    }
};

// Login page
router.get('/login', (req, res) => {
    console.log('Admin login route accessed'); // Add logging
    res.render('admin-login', { error: null });
});

// Login handler
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Check against environment variables (in production, use a proper database)
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('adminToken', token, { httpOnly: true });
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin-login', { error: 'Invalid credentials' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
});

// Dashboard with analytics
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const now = new Date();

        // Basic Metrics
        const totalEvents = await Event.countDocuments();
        const upcomingEvents = await Event.countDocuments({ 
            date: { $gt: now }, 
            completed: false 
        });
        const completedEvents = await Event.countDocuments({ completed: true });

        // Revenue Analytics
        const revenueAgg = await Event.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" },
                    average: { $avg: "$totalAmount" }
                }
            }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;
        const averageRevenue = Math.round(revenueAgg[0]?.average || 0);

        // Category Distribution
        const categoryStats = await Event.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Event Type Distribution
        const eventTypeStats = await Event.aggregate([
            {
                $group: {
                    _id: "$eventType",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Popular Venues
        const venueStats = await Event.aggregate([
            {
                $match: { venue: { $exists: true, $ne: null } }
            },
            {
                $group: {
                    _id: "$venue",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Payment Status Distribution
        const paymentStats = await Event.aggregate([
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        // Monthly Registration Trends
        const registrationTrends = await Event.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $project: {
                    _id: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-",
                            {
                                $cond: {
                                    if: { $lt: ["$_id.month", 10] },
                                    then: { $concat: ["0", { $toString: "$_id.month" }] },
                                    else: { $toString: "$_id.month" }
                                }
                            }
                        ]
                    },
                    count: 1,
                    revenue: 1
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Popular Time Slots
        const timeSlotStats = await Event.aggregate([
            {
                $group: {
                    _id: "$startTime",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Average Event Duration
        const durationStats = await Event.aggregate([
            {
                $addFields: {
                    startDateTime: {
                        $dateFromString: {
                            dateString: { $concat: ["2000-01-01T", "$startTime"] }
                        }
                    },
                    endDateTime: {
                        $dateFromString: {
                            dateString: { $concat: ["2000-01-01T", "$endTime"] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    durationMinutes: {
                        $divide: [
                            { $subtract: ["$endDateTime", "$startDateTime"] },
                            60000 // Convert milliseconds to minutes
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    averageDuration: { $avg: "$durationMinutes" }
                }
            }
        ]);

        res.render('admin-panel', {
            totalEvents,
            upcomingEvents,
            completedEvents,
            totalRevenue,
            averageRevenue,
            categoryStats,
            eventTypeStats,
            venueStats,
            paymentStats,
            registrationTrends,
            timeSlotStats,
            averageDuration: Math.round(durationStats[0]?.averageDuration || 0)
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

module.exports = router; 