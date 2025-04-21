// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('eventForm');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    const duration = document.getElementById('duration');
    const ratePerHour = document.getElementById('ratePerHour');
    const totalAmount = document.getElementById('totalAmount');
    const eventType = document.getElementById('eventType');
    const category = document.getElementById('category');
    const venueSelect = document.getElementById('venue');
    const venueGroup = document.querySelector('.venue-group');
    const onlineGroup = document.querySelector('.online-group');
    const termsAccepted = document.getElementById('termsAccepted');

    // Calculate duration and total amount
    function calculateDurationAndAmount() {
        if (startTime.value && endTime.value) {
            const start = new Date(`2000-01-01T${startTime.value}`);
            const end = new Date(`2000-01-01T${endTime.value}`);
            
            if (end < start) {
                end.setDate(end.getDate() + 1);
            }
            
            const diff = (end - start) / (1000 * 60 * 60); // Convert to hours
            const hours = Math.ceil(diff);
            
            duration.value = `${hours} hour${hours !== 1 ? 's' : ''}`;
            const amount = hours * parseInt(ratePerHour.value || 100);
            totalAmount.value = `₹${amount}`;
            return amount;
        }
        return 0;
    }

    // Show/hide venue and online link fields based on event type
    function toggleLocationFields() {
        const type = eventType.value;
        venueGroup.style.display = (type === 'Offline' || type === 'Hybrid') ? 'block' : 'none';
        onlineGroup.style.display = (type === 'Online' || type === 'Hybrid') ? 'block' : 'none';
    }

    // Load venues based on selected category
    async function loadVenues() {
        if (category.value && (eventType.value === 'Offline' || eventType.value === 'Hybrid')) {
            try {
                const response = await fetch(`/api/venues/category/${category.value}`);
                const venues = await response.json();
                
                // Clear existing options
                venueSelect.innerHTML = '<option value="">Select a Venue</option>';
                
                // Add new options
                venues.forEach(venue => {
                    const option = document.createElement('option');
                    option.value = venue._id;
                    option.textContent = `${venue.name} (Capacity: ${venue.capacity})`;
                    venueSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading venues:', error);
            }
        }
    }

    // Event listeners
    startTime.addEventListener('change', calculateDurationAndAmount);
    endTime.addEventListener('change', calculateDurationAndAmount);
    eventType.addEventListener('change', toggleLocationFields);
    category.addEventListener('change', loadVenues);
    eventType.addEventListener('change', loadVenues);

    // Initialize Razorpay payment
    async function initializePayment(eventData) {
        try {
            // Get the amount from the form
            const amount = calculateDurationAndAmount();
            
            if (!amount || amount <= 0) {
                throw new Error('Invalid amount. Please check duration and rate.');
            }

            console.log('Initializing payment with amount:', amount);

            // Create Razorpay order
            const orderResponse = await fetch('/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    amount: amount * 100, // Convert to paise
                    currency: "INR",
                    receipt: `receipt_${Date.now()}`
                })
            });
            
            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const orderData = await orderResponse.json();
            console.log('Order created:', orderData);
            
            if (!orderData.success || !orderData.order || !orderData.order.id) {
                throw new Error('Invalid order response from server');
            }

            // Configure Razorpay options
            const options = {
                key: razorpayKeyId, // Your API key
                amount: orderData.order.amount, // Amount in paise
                currency: orderData.order.currency,
                name: "Event Management System",
                description: `Registration for ${eventData.name}`,
                order_id: orderData.order.id,
                handler: async function (response) {
                    try {
                        console.log('Payment successful:', response);
                        
                        // Verify payment on server
                        const verifyResponse = await fetch('/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        if (!verifyResponse.ok) {
                            throw new Error('Payment verification failed');
                        }

                        const verifyData = await verifyResponse.json();
                        if (!verifyData.success) {
                            throw new Error(verifyData.error || 'Payment verification failed');
                        }

                        // Add payment details to event data
                        eventData.razorpayOrderId = response.razorpay_order_id;
                        eventData.razorpayPaymentId = response.razorpay_payment_id;
                        eventData.razorpaySignature = response.razorpay_signature;
                        eventData.totalAmount = amount;

                        // Submit event data to server
                        const eventResponse = await fetch('/add-event', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(eventData)
                        });

                        if (!eventResponse.ok) {
                            const errorData = await eventResponse.json();
                            throw new Error(errorData.error || 'Failed to register event');
                        }

                        const result = await eventResponse.json();
                        
                        if (result.success) {
                            alert('Event registered successfully!');
                            window.location.href = '/';
                        } else {
                            throw new Error(result.error || 'Failed to register event');
                        }
                    } catch (error) {
                        console.error('Event registration error:', error);
                        alert('Error registering event: ' + error.message);
                    }
                },
                prefill: {
                    name: eventData.organizerName || '',
                    email: eventData.organizerEmail || '',
                    contact: eventData.contactNumber || ''
                },
                theme: {
                    color: "#3498db"
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment modal closed');
                        alert('Payment cancelled. Please try again to complete registration.');
                    }
                }
            };

            console.log('Razorpay options:', options);

            // Initialize Razorpay
            const razorpay = new Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                alert(`Payment failed: ${response.error.description}`);
            });
            razorpay.open();
        } catch (error) {
            console.error('Payment initialization error:', error);
            alert('Error initializing payment: ' + error.message);
        }
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!termsAccepted.checked) {
            alert('Please accept the terms and conditions');
            return;
        }

        try {
            const formData = new FormData(form);
            const eventData = Object.fromEntries(formData.entries());
            
            // Calculate total amount
            const start = new Date(`2000-01-01T${eventData.startTime}`);
            const end = new Date(`2000-01-01T${eventData.endTime}`);
            if (end < start) end.setDate(end.getDate() + 1);
            const hours = Math.ceil((end - start) / (1000 * 60 * 60));
            
            // Get venue rate if offline event
            if (eventData.eventType !== 'Online' && eventData.venue) {
                try {
                    const response = await fetch(`/api/venues/${eventData.venue}`);
                    const venue = await response.json();
                    eventData.ratePerHour = venue.ratePerHour || 100;
                } catch (error) {
                    console.error('Error fetching venue details:', error);
                    eventData.ratePerHour = 100; // Default rate if venue fetch fails
                }
            } else {
                eventData.ratePerHour = 100; // Default rate for online events
            }
            
            eventData.totalAmount = hours * eventData.ratePerHour;
            
            // Initialize payment
            await initializePayment(eventData);
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Error processing form. Please try again.');
        }
    });

    // Initialize
    toggleLocationFields();
});

// Add event search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('eventSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const eventCards = document.querySelectorAll('.sidebar-event-card');
            
            eventCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const category = card.querySelector('.event-category') ? 
                    card.querySelector('.event-category').textContent.toLowerCase() : '';
                const date = card.querySelector('.event-date').textContent.toLowerCase();
                
                const isVisible = title.includes(searchTerm) || 
                                category.includes(searchTerm) || 
                                date.includes(searchTerm);
                
                card.style.display = isVisible ? 'block' : 'none';
                
                // Add a smooth fade effect
                if (isVisible) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-10px)';
                }
            });
        });
    }
});
