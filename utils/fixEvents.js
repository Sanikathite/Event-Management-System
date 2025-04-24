const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

async function fixEvents() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('Connected to MongoDB');

        const currentDate = new Date();
        
        // Get all events
        const events = await Event.find({});
        
        for (const event of events) {
            const eventDate = new Date(event.date);
            const [hours, minutes] = event.endTime.split(':');
            const eventEndDateTime = new Date(eventDate);
            eventEndDateTime.setHours(parseInt(hours), parseInt(minutes));
            
            // Check if event should be marked as completed
            const shouldBeCompleted = eventEndDateTime < currentDate;
            
            // If the event's completed status is incorrect, update it
            if (event.completed !== shouldBeCompleted) {
                await Event.findByIdAndUpdate(event._id, { completed: shouldBeCompleted });
                console.log(`Fixed event "${event.name}": ${shouldBeCompleted ? 'completed' : 'upcoming'}`);
            }
        }
        
        console.log('Finished fixing events');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing events:', error);
        process.exit(1);
    }
}

fixEvents(); 