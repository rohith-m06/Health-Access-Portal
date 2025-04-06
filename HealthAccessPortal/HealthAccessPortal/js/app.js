/**
 * Main Application JavaScript
 * Handles core functionality across the HealthAccess application
 */

// Global application state
const HealthAccess = {
  // Application settings
  settings: {
    offlineMode: false,
    dataLastUpdated: null,
    language: 'en',
    fontSize: 'medium',
    highContrast: false
  },
  
  // Cache for current user location if permission granted
  userLocation: null,
  
  // Application initialization
  init: function() {
    console.log('Initializing HealthAccess application...');
    
    // Load settings from localStorage
    this.loadSettings();
    
    // Initialize UI components
    this.initUI();
    
    // Check if we're running in standalone/installed PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('Running in standalone/PWA mode');
      document.body.classList.add('standalone-mode');
    }
    
    // Register service worker if supported
    this.registerServiceWorker();
    
    // Load all required data
    this.loadInitialData();
    
    console.log('HealthAccess application initialized successfully');
  },
  
  // Load user settings from localStorage
  loadSettings: function() {
    try {
      const savedSettings = localStorage.getItem('healthaccess-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        this.settings = { ...this.settings, ...parsedSettings };
        console.log('Settings loaded from localStorage');
      }
      
      // Apply settings to UI
      this.applySettings();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },
  
  // Save current settings to localStorage
  saveSettings: function() {
    try {
      localStorage.setItem('healthaccess-settings', JSON.stringify(this.settings));
      console.log('Settings saved to localStorage');
      
      // Apply settings to UI
      this.applySettings();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
  
  // Apply current settings to the UI
  applySettings: function() {
    // Apply font size
    document.documentElement.setAttribute('data-font-size', this.settings.fontSize);
    
    // Apply high contrast if enabled
    if (this.settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Apply offline mode indicator if enabled
    if (this.settings.offlineMode) {
      document.body.classList.add('offline-mode');
      this.showNotification('Offline mode is active. Some features may be limited.', 'info');
    } else {
      document.body.classList.remove('offline-mode');
    }
  },
  
  // Initialize UI components and event listeners
  initUI: function() {
    // Mobile menu toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        // Toggle between menu and x icon
        const icon = menuBtn.querySelector('svg');
        if (icon) {
          if (navLinks.classList.contains('show')) {
            icon.setAttribute('data-feather', 'x');
          } else {
            icon.setAttribute('data-feather', 'menu');
          }
          feather.replace();
        }
      });
    }
    
    // Offline save button
    const saveOfflineBtn = document.getElementById('saveOfflineBtn');
    if (saveOfflineBtn) {
      saveOfflineBtn.addEventListener('click', () => {
        this.enableOfflineMode();
      });
    }
    
    // Initialize any tooltips
    this.initTooltips();
    
    // Add event listeners for any collapsible sections
    this.initCollapsibles();
  },
  
  // Register service worker for offline functionality if supported
  registerServiceWorker: function() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    } else {
      console.log('Service workers not supported');
    }
  },
  
  // Enable offline mode
  enableOfflineMode: function() {
    this.settings.offlineMode = true;
    this.saveSettings();
    
    // Cache current page and resources
    if ('caches' in window) {
      const currentPageUrl = window.location.href;
      caches.open('healthaccess-offline').then(cache => {
        cache.add(currentPageUrl);
        this.showNotification('This page has been saved for offline use', 'success');
      });
    } else {
      this.showNotification('Your browser does not support offline storage', 'warning');
    }
  },
  
  // Load initial application data
  loadInitialData: function() {
    // We'll load data from localStorage first, then try to update from built-in data
    // This ensures we have data available even if this is the first run
    
    // Load healthcare facilities data
    if (!localStorage.getItem('healthcare-facilities')) {
      // If no data exists in localStorage, initialize with empty array
      localStorage.setItem('healthcare-facilities', JSON.stringify([]));
    }
    
    // Load educational resources
    if (!localStorage.getItem('educational-resources')) {
      // If no data exists in localStorage, initialize with empty array
      localStorage.setItem('educational-resources', JSON.stringify([]));
    }
    
    // Load telehealth services
    if (!localStorage.getItem('telehealth-services')) {
      // If no data exists in localStorage, initialize with empty array
      localStorage.setItem('telehealth-services', JSON.stringify([]));
    }
    
    // Now populate with built-in data
    this.populateInitialData();
  },
  
  // Populate with initial built-in data
  populateInitialData: function() {
    // We'll hydrate our localStorage with initial data
    // This would normally come from a server, but since we're offline-only,
    // we'll include this data directly in our JavaScript
    
    // Sample healthcare facilities data
    const healthcareFacilities = [
      {
        id: 1,
        name: "Community Health Clinic",
        type: "Primary Care",
        address: "123 Main St, Rural County",
        coordinates: [40.7128, -74.0060],
        phone: "555-123-4567",
        hours: "Mon-Fri: 8am-5pm",
        services: ["General Medicine", "Vaccinations", "Basic Lab Tests"],
        acceptsMedicaid: true,
        acceptsMedicare: true,
        slidingFeeScale: true
      },
      {
        id: 2,
        name: "County Hospital",
        type: "Hospital",
        address: "456 Health Drive, Rural County",
        coordinates: [40.7145, -74.0090],
        phone: "555-987-6543",
        hours: "24/7",
        services: ["Emergency Care", "Surgery", "Maternity", "Pediatrics"],
        acceptsMedicaid: true,
        acceptsMedicare: true,
        slidingFeeScale: false
      },
      {
        id: 3,
        name: "Mobile Health Unit",
        type: "Mobile Clinic",
        address: "Various Locations",
        coordinates: [40.7200, -74.0000],
        phone: "555-789-0123",
        hours: "Check Schedule",
        services: ["Basic Check-ups", "Vaccinations", "Health Education"],
        acceptsMedicaid: true,
        acceptsMedicare: true,
        slidingFeeScale: true,
        mobileSchedule: [
          { day: "Monday", location: "North County Library", time: "9am-1pm" },
          { day: "Wednesday", location: "South Community Center", time: "2pm-6pm" },
          { day: "Friday", location: "East County School", time: "10am-2pm" }
        ]
      },
      {
        id: 4,
        name: "Rural Health Center",
        type: "Primary Care",
        address: "789 Country Road, Rural County",
        coordinates: [40.7300, -74.0150],
        phone: "555-456-7890",
        hours: "Mon-Thu: 9am-6pm, Fri: 9am-3pm",
        services: ["Family Medicine", "Chronic Disease Management", "Mental Health"],
        acceptsMedicaid: true,
        acceptsMedicare: true,
        slidingFeeScale: true
      },
      {
        id: 5,
        name: "Women's Health Clinic",
        type: "Specialty Care",
        address: "101 Care Lane, Rural County",
        coordinates: [40.7150, -73.9950],
        phone: "555-234-5678",
        hours: "Tue-Sat: 10am-4pm",
        services: ["Prenatal Care", "Family Planning", "Women's Health Screenings"],
        acceptsMedicaid: true,
        acceptsMedicare: true,
        slidingFeeScale: true
      }
    ];
    
    // Sample educational resources
    const educationalResources = [
      {
        id: 1,
        title: "Understanding Preventive Care",
        category: "Preventive Health",
        description: "Learn about the importance of preventive health measures and regular check-ups.",
        content: "Preventive care is the care you receive to prevent illnesses or diseases. It includes screenings, regular check-ups, and patient counseling to prevent health problems. Preventive care is important because it helps you stay healthy and detect potential problems early when they're easier to treat.",
        downloadable: true,
        language: "English",
        readingLevel: "Basic"
      },
      {
        id: 2,
        title: "Managing Chronic Conditions",
        category: "Chronic Disease",
        description: "Tips and information on managing common chronic conditions in rural settings.",
        content: "Chronic conditions require ongoing management and regular medical care. This guide provides information on how to manage conditions like diabetes, hypertension, and asthma with limited access to healthcare facilities.",
        downloadable: true,
        language: "English",
        readingLevel: "Intermediate"
      },
      {
        id: 3,
        title: "Children's Health Guide",
        category: "Pediatric Health",
        description: "Essential information for keeping children healthy with limited healthcare access.",
        content: "This guide covers childhood vaccinations, common illnesses, nutrition, and growth and development milestones. Learn when to seek medical attention and how to care for minor illnesses at home.",
        downloadable: true,
        language: "English",
        readingLevel: "Basic"
      },
      {
        id: 4,
        title: "Mental Health Resources",
        category: "Mental Health",
        description: "Resources and techniques for maintaining mental health in rural communities.",
        content: "Mental health is just as important as physical health. This resource provides information on recognizing signs of mental health issues, self-care techniques, and how to find help in rural communities.",
        downloadable: true,
        language: "English",
        readingLevel: "Intermediate"
      },
      {
        id: 5,
        title: "Emergency Preparedness",
        category: "Emergency Care",
        description: "How to prepare for and respond to medical emergencies when healthcare is not immediately available.",
        content: "In rural areas, emergency medical services may take longer to arrive. Learn how to prepare for common emergencies, perform basic first aid, and when to seek emergency care versus when home care is appropriate.",
        downloadable: true,
        language: "English",
        readingLevel: "Basic"
      }
    ];
    
    // Sample telehealth services
    const telehealthServices = [
      {
        id: 1,
        name: "Rural Telehealth Connect",
        description: "General medical consultations via video or phone call.",
        website: "https://ruraltelehealth.org",
        phone: "888-555-1234",
        hours: "24/7",
        cost: "Varies, accepts most insurance",
        appointmentRequired: true,
        services: ["General Medicine", "Follow-up Care", "Prescription Refills"]
      },
      {
        id: 2,
        name: "TeleMental Health",
        description: "Mental health services including therapy and medication management.",
        website: "https://telemental.org",
        phone: "888-555-5678",
        hours: "Mon-Fri: 8am-8pm, Sat: 9am-5pm",
        cost: "Sliding scale available",
        appointmentRequired: true,
        services: ["Therapy", "Psychiatry", "Substance Use Counseling"]
      },
      {
        id: 3,
        name: "Virtual Urgent Care",
        description: "Urgent care services for non-emergency conditions.",
        website: "https://virtualurgent.org",
        phone: "888-555-9012",
        hours: "24/7",
        cost: "$50-75 per visit, some insurance accepted",
        appointmentRequired: false,
        services: ["Urgent Care", "Minor Illness/Injury", "COVID-19 Screening"]
      },
      {
        id: 4,
        name: "Pediatric Telehealth",
        description: "Virtual care for children and adolescents.",
        website: "https://kidstelehealth.org",
        phone: "888-555-3456",
        hours: "Mon-Fri: 8am-10pm, Sat-Sun: 9am-5pm",
        cost: "Varies, most insurance accepted",
        appointmentRequired: true,
        services: ["Pediatric Care", "Developmental Concerns", "Behavioral Health"]
      },
      {
        id: 5,
        name: "Chronic Care Connect",
        description: "Specialized telehealth for managing chronic conditions.",
        website: "https://chroniccare.org",
        phone: "888-555-7890",
        hours: "Mon-Fri: 9am-6pm",
        cost: "Most insurance accepted, Medicare/Medicaid accepted",
        appointmentRequired: true,
        services: ["Diabetes Management", "Hypertension", "COPD", "Heart Disease"]
      }
    ];
    
    // Store the data in localStorage if it doesn't exist already or if it's empty
    const storedFacilities = JSON.parse(localStorage.getItem('healthcare-facilities') || '[]');
    if (storedFacilities.length === 0) {
      localStorage.setItem('healthcare-facilities', JSON.stringify(healthcareFacilities));
    }
    
    const storedResources = JSON.parse(localStorage.getItem('educational-resources') || '[]');
    if (storedResources.length === 0) {
      localStorage.setItem('educational-resources', JSON.stringify(educationalResources));
    }
    
    const storedTelehealth = JSON.parse(localStorage.getItem('telehealth-services') || '[]');
    if (storedTelehealth.length === 0) {
      localStorage.setItem('telehealth-services', JSON.stringify(telehealthServices));
    }
    
    // Update the last updated timestamp
    this.settings.dataLastUpdated = new Date().toISOString();
    this.saveSettings();
  },
  
  // Initialize tooltips on the page
  initTooltips: function() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
      tooltip.addEventListener('mouseenter', () => {
        const tooltipText = tooltip.getAttribute('data-tooltip');
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip';
        tooltipEl.textContent = tooltipText;
        document.body.appendChild(tooltipEl);
        
        const rect = tooltip.getBoundingClientRect();
        tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 10}px`;
        tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
        tooltipEl.style.opacity = '1';
      });
      
      tooltip.addEventListener('mouseleave', () => {
        const tooltipEl = document.querySelector('.tooltip');
        if (tooltipEl) {
          tooltipEl.remove();
        }
      });
    });
  },
  
  // Initialize collapsible sections
  initCollapsibles: function() {
    const collapsibles = document.querySelectorAll('.collapsible-header');
    collapsibles.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        header.classList.toggle('active');
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  },
  
  // Show a notification to the user
  showNotification: function(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i data-feather="${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close"><i data-feather="x"></i></button>
    `;
    
    // Add to the DOM
    document.body.appendChild(notification);
    
    // Replace any feather icons
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
    
    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      notification.classList.add('notification-hiding');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
  },
  
  // Get the appropriate icon for notification type
  getNotificationIcon: function(type) {
    switch(type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'error':
        return 'alert-octagon';
      case 'info':
      default:
        return 'info';
    }
  },
  
  // Get user's location if permission is granted
  getUserLocation: function() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            resolve(this.userLocation);
          },
          (error) => {
            console.error('Error getting location:', error);
            reject(error);
          }
        );
      } else {
        const error = new Error('Geolocation is not supported by this browser.');
        console.error(error);
        reject(error);
      }
    });
  },
  
  // Calculate distance between two lat/lng points in km (haversine formula)
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  },
  
  // Convert degrees to radians
  deg2rad: function(deg) {
    return deg * (Math.PI/180);
  }
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  HealthAccess.init();
});
