const Event = require('../models/Event');

async function updateEventStatus() {
    try {
        const currentDate = new Date();
        
        // Find all uncompleted events
        const events = await Event.find({ completed: false });
        
        for (const event of events) {
            // Create a new date object from the event date
            const eventDate = new Date(event.date);
            
            // Set the end time
            const [hours, minutes] = event.endTime.split(':');
            const eventEndDateTime = new Date(eventDate);
            eventEndDateTime.setHours(parseInt(hours), parseInt(minutes));
            
            // Compare dates properly
            // Only mark as completed if the event end time has passed
            if (eventEndDateTime < currentDate) {
                console.log(`Event: ${event.name}`);
                console.log(`Event end time: ${eventEndDateTime}`);
                console.log(`Current time: ${currentDate}`);
                await Event.findByIdAndUpdate(event._id, { completed: true });
                console.log(`Event ${event.name} marked as completed`);
            } else {
                // If the event was incorrectly marked as completed, fix it
                if (event.completed) {
                    await Event.findByIdAndUpdate(event._id, { completed: false });
                    console.log(`Event ${event.name} marked as upcoming (fixed)`);
                }
            }
        }
    } catch (error) {
        console.error('Error updating event status:', error);
    }
}

// Function to start periodic updates
function startEventStatusUpdater(interval = 5 * 60 * 1000) { // Default 5 minutes
    // Run immediately on start
    updateEventStatus();
    
    // Then run periodically
    setInterval(updateEventStatus, interval);
}

module.exports = {
    updateEventStatus,
    startEventStatusUpdater
}; 