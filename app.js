document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // STATE VARIABLES
    // ==========================================================================
    let selectedServices = [];
    let selectedStylist = "Any Stylist";
    let selectedDate = "";
    let selectedTime = "";
    let currentTestimonialSlide = 0;
    
    // Static Time Slots Template
    const timeSlots = [
        { time: "09:00 AM", period: "morning" },
        { time: "10:00 AM", period: "morning" },
        { time: "11:30 AM", period: "morning" },
        { time: "01:00 PM", period: "afternoon" },
        { time: "02:30 PM", period: "afternoon" },
        { time: "03:45 PM", period: "afternoon" },
        { time: "05:00 PM", period: "evening" },
        { time: "06:30 PM", period: "evening" }
    ];

    // ==========================================================================
    // DOM ELEMENTS
    // ==========================================================================
    const body = document.body;
    const navbar = document.getElementById('navbar');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    // Services Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    
    // Booking Form Elements
    const bookingDateInput = document.getElementById('booking-date');
    const slotsGrid = document.getElementById('slots-grid');
    const stylistOptions = document.querySelectorAll('.stylist-option');
    const appointmentForm = document.getElementById('appointment-form');
    const selectedServicesBox = document.getElementById('selected-services-box');
    const fastServiceTags = document.querySelectorAll('.fast-service-tag');
    
    // Summary Card Elements
    const summaryStylist = document.getElementById('summary-stylist');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summaryServicesItems = document.getElementById('summary-services-items');
    const summaryTotalPrice = document.getElementById('summary-total-price');
    const btnSubmitBooking = document.getElementById('btn-submit-booking');
    
    // Gallery Elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Testimonial Elements
    const testimonialTrack = document.getElementById('testimonial-track');
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.dot');
    const btnPrevTestimonial = document.getElementById('slider-prev');
    const btnNextTestimonial = document.getElementById('slider-next');
    
    // Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const ticketIdSpan = document.getElementById('ticket-id');
    const ticketStylistSpan = document.getElementById('ticket-stylist');
    const ticketDatetimeSpan = document.getElementById('ticket-datetime');
    const ticketTotalSpan = document.getElementById('ticket-total');

    // ==========================================================================
    // THEME TOGGLE (DARK/LIGHT)
    // ==========================================================================
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    body.className = savedTheme;

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
    });

    // ==========================================================================
    // SCROLL EFFECTS & NAVIGATION
    // ==========================================================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close Menu on Link Click
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // ==========================================================================
    // SERVICES TAB FILTERING
    // ==========================================================================
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.getAttribute('data-category');
            
            serviceCards.forEach(card => {
                if (card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ==========================================================================
    // SELECTION OF SERVICES
    // ==========================================================================
    
    // Sync UI states of "+" buttons on cards and fast tags
    function syncServiceButtons() {
        // Update service menu cards
        document.querySelectorAll('.btn-add-service').forEach(btn => {
            const serviceId = btn.getAttribute('data-id');
            const isAdded = selectedServices.some(s => s.id === serviceId);
            if (isAdded) {
                btn.classList.add('added');
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
            } else {
                btn.classList.remove('added');
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg>`;
            }
        });

        // Update booking section quick tags
        fastServiceTags.forEach(tag => {
            const serviceId = tag.getAttribute('data-id');
            const isAdded = selectedServices.some(s => s.id === serviceId);
            if (isAdded) {
                tag.classList.add('added');
                tag.innerText = `✓ ${tag.getAttribute('data-name').split(' ').slice(0, 2).join(' ')}`;
            } else {
                tag.classList.remove('added');
                tag.innerText = `+ ${tag.getAttribute('data-name').split(' ').slice(0, 2).join(' ')} (₹${tag.getAttribute('data-price')})`;
            }
        });
    }

    function addService(id, name, price) {
        if (!selectedServices.some(item => item.id === id)) {
            selectedServices.push({ id, name, price: parseInt(price) });
            updateBookingDetails();
        }
    }

    function removeService(id) {
        selectedServices = selectedServices.filter(item => item.id !== id);
        updateBookingDetails();
    }

    function toggleService(id, name, price) {
        const index = selectedServices.findIndex(item => item.id === id);
        if (index > -1) {
            selectedServices.splice(index, 1);
        } else {
            selectedServices.push({ id, name, price: parseInt(price) });
        }
        updateBookingDetails();
    }

    // Attach click events to Service card "+" buttons
    document.querySelectorAll('.btn-add-service').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            toggleService(id, name, price);
        });
    });

    // Attach click events to fast booking tags
    fastServiceTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const id = tag.getAttribute('data-id');
            const name = tag.getAttribute('data-name');
            const price = tag.getAttribute('data-price');
            toggleService(id, name, price);
        });
    });

    // Update Booking State & Calculations
    function updateBookingDetails() {
        syncServiceButtons();
        
        // 1. Render Selected Services list inside Step 1 form
        if (selectedServices.length === 0) {
            selectedServicesBox.innerHTML = `<p class="placeholder-text">Please click the "+" on any service card in the menu above, or choose a fast-add service below:</p>`;
        } else {
            selectedServicesBox.innerHTML = '';
            selectedServices.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'selected-service-item';
                itemDiv.innerHTML = `
                    <span class="service-name">${item.name}</span>
                    <div class="service-price-remove">
                        <span>₹${item.price}</span>
                        <button type="button" class="remove-btn" data-id="${item.id}">×</button>
                    </div>
                `;
                
                // Remove listener
                itemDiv.querySelector('.remove-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeService(item.id);
                });
                
                selectedServicesBox.appendChild(itemDiv);
            });
        }

        // 2. Render summary side card services list
        if (selectedServices.length === 0) {
            summaryServicesItems.innerHTML = `<p class="no-services-msg">No services selected yet.</p>`;
        } else {
            summaryServicesItems.innerHTML = '';
            selectedServices.forEach(item => {
                const miniItem = document.createElement('div');
                miniItem.className = 'summary-service-item-mini';
                miniItem.innerHTML = `
                    <span>${item.name}</span>
                    <span>₹${item.price}</span>
                `;
                summaryServicesItems.appendChild(miniItem);
            });
        }

        // 3. Recalculate price
        const total = selectedServices.reduce((sum, item) => sum + item.price, 0);
        summaryTotalPrice.textContent = `₹${total}`;

        // 4. Validate Button Availability
        validateBookingSubmit();
    }

    // ==========================================================================
    // STYLIST SELECTION
    // ==========================================================================
    stylistOptions.forEach(option => {
        option.addEventListener('click', () => {
            stylistOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            const radioInput = option.querySelector('input[type="radio"]');
            radioInput.checked = true;
            
            selectedStylist = radioInput.value;
            summaryStylist.textContent = selectedStylist;
        });
    });

    // ==========================================================================
    // DATE & TIME PICKER
    // ==========================================================================
    
    // Set min date of date picker to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDateString = `${year}-${month}-${day}`;
    bookingDateInput.setAttribute('min', minDateString);

    bookingDateInput.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        if (selectedDate) {
            // Format date beautifully
            const dateObj = new Date(selectedDate);
            const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
            summaryDate.textContent = dateObj.toLocaleDateString('en-US', options);
            
            generateSlots();
        } else {
            summaryDate.textContent = "Not selected";
            slotsGrid.innerHTML = `<p class="placeholder-text select-date-notice">Please pick a date first.</p>`;
        }
        selectedTime = "";
        summaryTime.textContent = "Not selected";
        validateBookingSubmit();
    });

    function generateSlots() {
        slotsGrid.innerHTML = '';
        
        // Render slots
        timeSlots.forEach((slot, index) => {
            const slotButton = document.createElement('div');
            slotButton.className = 'time-slot';
            slotButton.textContent = slot.time;
            
            // Randomly mark a couple of slots as "booked" for realistic feel (based on the date day)
            const dayOfWeek = new Date(selectedDate).getDay();
            const isBooked = (dayOfWeek + index) % 5 === 0;
            
            if (isBooked) {
                slotButton.classList.add('hidden'); // Simulating unavailable slots
            } else {
                slotButton.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    slotButton.classList.add('selected');
                    selectedTime = slot.time;
                    summaryTime.textContent = selectedTime;
                    validateBookingSubmit();
                });
                slotsGrid.appendChild(slotButton);
            }
        });
        
        if (slotsGrid.children.length === 0) {
            slotsGrid.innerHTML = `<p class="placeholder-text select-date-notice">No slots available. Try another date.</p>`;
        }
    }

    // ==========================================================================
    // VALIDATIONS
    // ==========================================================================
    function validateBookingSubmit() {
        const hasServices = selectedServices.length > 0;
        const hasDate = selectedDate !== "";
        const hasTime = selectedTime !== "";
        const hasName = document.getElementById('client-name').value.trim() !== "";
        const hasEmail = document.getElementById('client-email').value.trim() !== "";
        const hasPhone = document.getElementById('client-phone').value.trim() !== "";
        
        if (hasServices && hasDate && hasTime) {
            btnSubmitBooking.removeAttribute('disabled');
        } else {
            btnSubmitBooking.setAttribute('disabled', 'true');
        }
    }

    // Attach listeners on inputs to trigger validation
    ['client-name', 'client-email', 'client-phone'].forEach(id => {
        document.getElementById(id).addEventListener('input', validateBookingSubmit);
    });

    // ==========================================================================
    // LOOKBOOK GALLERY FILTER
    // ==========================================================================
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                // CSS filter animation
                item.style.transform = 'scale(0.8)';
                item.style.opacity = '0';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hidden');
                        setTimeout(() => {
                            item.style.transform = 'scale(1)';
                            item.style.opacity = '1';
                        }, 50);
                    } else {
                        item.classList.add('hidden');
                    }
                }, 300);
            });
        });
    });

    // ==========================================================================
    // TESTIMONIAL SLIDER
    // ==========================================================================
    function updateTestimonialSlider() {
        testimonialTrack.style.transform = `translateX(-${currentTestimonialSlide * 100}%)`;
        
        // Update dots
        testimonialDots.forEach((dot, index) => {
            if (index === currentTestimonialSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function nextTestimonial() {
        currentTestimonialSlide = (currentTestimonialSlide + 1) % testimonialSlides.length;
        updateTestimonialSlider();
    }

    function prevTestimonial() {
        currentTestimonialSlide = (currentTestimonialSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
        updateTestimonialSlider();
    }

    btnNextTestimonial.addEventListener('click', nextTestimonial);
    btnPrevTestimonial.addEventListener('click', prevTestimonial);

    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentTestimonialSlide = index;
            updateTestimonialSlider();
        });
    });

    // Auto Slide
    let autoSlideInterval = setInterval(nextTestimonial, 6000);

    // Reset timer on manual click
    [btnPrevTestimonial, btnNextTestimonial, ...testimonialDots].forEach(control => {
        control.addEventListener('click', () => {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextTestimonial, 8000);
        });
    });

    // ==========================================================================
    // APPOINTMENT BOOKING SUBMISSION & MODAL
    // ==========================================================================
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Double check validation
        const total = selectedServices.reduce((sum, item) => sum + item.price, 0);
        if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
            return;
        }

        // Generate Ticket details
        const randId = 'PHS-' + Math.floor(10000 + Math.random() * 90000);
        const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        
        ticketIdSpan.textContent = randId;
        ticketStylistSpan.textContent = selectedStylist;
        ticketDatetimeSpan.textContent = `${formattedDate} at ${selectedTime}`;
        ticketTotalSpan.textContent = `₹${total}`;
        
        // Open Modal
        confirmModal.classList.add('open');
    });

    // Reset App States when Modal is closed
    btnCloseModal.addEventListener('click', () => {
        confirmModal.classList.remove('open');
        
        // Reset state values
        selectedServices = [];
        selectedStylist = "Any Stylist";
        selectedDate = "";
        selectedTime = "";
        
        // Reset Inputs
        appointmentForm.reset();
        
        // Reset Stylist Active option back to Default
        stylistOptions.forEach(opt => opt.classList.remove('selected'));
        stylistOptions[0].classList.add('selected');
        stylistOptions[0].querySelector('input[type="radio"]').checked = true;
        
        // Reset summary views
        summaryStylist.textContent = "Any Stylist";
        summaryDate.textContent = "Not selected";
        summaryTime.textContent = "Not selected";
        
        // Re-render empty lists
        updateBookingDetails();
        
        // Scroll back to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
