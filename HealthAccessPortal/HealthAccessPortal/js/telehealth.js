/**
 * Telehealth JavaScript
 * Handles telehealth services directory
 */

// Telehealth Directory module
const TelehealthDirectory = {
  // Current telehealth services data
  services: [],
  
  // Initialize telehealth functionality
  init: function() {
    console.log('Initializing telehealth directory...');
    
    // Load telehealth services from localStorage
    this.loadServices();
    
    // Initialize UI components
    this.initUI();
    
    console.log('Telehealth directory initialized');
  },
  
  // Load telehealth services from localStorage
  loadServices: function() {
    try {
      // Get services from localStorage
      const servicesData = localStorage.getItem('telehealth-services');
      if (servicesData) {
        this.services = JSON.parse(servicesData);
        console.log(`Loaded ${this.services.length} telehealth services`);
        
        // Display services
        this.displayServices();
      } else {
        console.error('No telehealth services data found');
        HealthAccess.showNotification('No telehealth services data available. Please check your settings.', 'error');
      }
    } catch (error) {
      console.error('Error loading telehealth services:', error);
      HealthAccess.showNotification('Error loading telehealth services data.', 'error');
    }
  },
  
  // Display telehealth services based on filters
  displayServices: function(filter = {}) {
    const servicesContainer = document.getElementById('telehealthContainer');
    if (!servicesContainer) return;
    
    // Filter services
    let filteredServices = this.services;
    
    if (filter.service && filter.service !== 'all') {
      filteredServices = filteredServices.filter(service => 
        service.services.includes(filter.service)
      );
    }
    
    if (filter.appointmentRequired !== undefined) {
      filteredServices = filteredServices.filter(service => 
        service.appointmentRequired === filter.appointmentRequired
      );
    }
    
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filteredServices = filteredServices.filter(service => 
        service.name.toLowerCase().includes(searchTerm) || 
        service.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Clear container
    servicesContainer.innerHTML = '';
    
    // Check if we have services to display
    if (filteredServices.length === 0) {
      servicesContainer.innerHTML = `
        <div class="no-services">
          <i data-feather="video-off"></i>
          <p>No telehealth services match your filters. Try different criteria.</p>
          <button id="clearFilters" class="btn btn-secondary">Clear Filters</button>
        </div>
      `;
      feather.replace();
      
      // Add event listener to clear filters button
      const clearFiltersBtn = document.getElementById('clearFilters');
      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
          const filterForm = document.getElementById('telehealthFilters');
          if (filterForm) {
            filterForm.reset();
          }
          this.displayServices();
        });
      }
      
      return;
    }
    
    // Create service cards
    filteredServices.forEach(service => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'telehealth-card';
      
      // Create list of services
      const servicesList = service.services.map(s => `<li>${s}</li>`).join('');
      
      serviceCard.innerHTML = `
        <div class="telehealth-card-header">
          <h3>${service.name}</h3>
          <span class="appointment-badge ${service.appointmentRequired ? 'required' : 'not-required'}">
            ${service.appointmentRequired ? 'Appointment Required' : 'No Appointment Needed'}
          </span>
        </div>
        <div class="telehealth-card-body">
          <p>${service.description}</p>
          
          <div class="telehealth-details">
            <div class="telehealth-detail">
              <i data-feather="clock"></i>
              <span>Hours: ${service.hours}</span>
            </div>
            <div class="telehealth-detail">
              <i data-feather="dollar-sign"></i>
              <span>Cost: ${service.cost}</span>
            </div>
            <div class="telehealth-detail">
              <i data-feather="phone"></i>
              <span>Phone: <a href="tel:${service.phone}" class="telehealth-phone">${service.phone}</a></span>
            </div>
          </div>
          
          <div class="telehealth-services">
            <h4>Services Offered:</h4>
            <ul>
              ${servicesList}
            </ul>
          </div>
        </div>
        <div class="telehealth-card-footer">
          <a href="${service.website}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            <i data-feather="external-link"></i> Visit Website
          </a>
          <button class="btn btn-secondary save-telehealth" data-service-id="${service.id}">
            <i data-feather="bookmark"></i> Save
          </button>
        </div>
      `;
      
      servicesContainer.appendChild(serviceCard);
    });
    
    // Replace feather icons
    feather.replace();
    
    // Add event listeners to save buttons
    const saveButtons = document.querySelectorAll('.save-telehealth');
    saveButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const serviceId = parseInt(e.target.closest('.save-telehealth').dataset.serviceId);
        this.saveService(serviceId);
      });
    });
  },
  
  // Save telehealth service for offline use
  saveService: function(serviceId) {
    try {
      // Find the service
      const service = this.services.find(s => s.id === serviceId);
      if (!service) {
        console.error('Service not found:', serviceId);
        return;
      }
      
      // Get currently saved services
      const savedServices = JSON.parse(localStorage.getItem('saved-telehealth-services') || '[]');
      
      // Check if service is already saved
      const alreadySaved = savedServices.some(s => s.id === serviceId);
      if (alreadySaved) {
        HealthAccess.showNotification('This telehealth service is already saved', 'info');
        return;
      }
      
      // Add to saved services
      savedServices.push(service);
      localStorage.setItem('saved-telehealth-services', JSON.stringify(savedServices));
      
      HealthAccess.showNotification('Telehealth service saved for offline use', 'success');
    } catch (error) {
      console.error('Error saving telehealth service:', error);
      HealthAccess.showNotification('Error saving telehealth service', 'error');
    }
  },
  
  // Initialize UI elements and event handlers
  initUI: function() {
    // Collect all unique services for filter dropdown
    const allServices = new Set();
    this.services.forEach(service => {
      service.services.forEach(s => allServices.add(s));
    });
    
    // Populate service filter dropdown
    const serviceFilter = document.getElementById('serviceFilter');
    if (serviceFilter) {
      // Add "All Services" option
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'All Services';
      serviceFilter.appendChild(allOption);
      
      // Add each service type
      [...allServices].sort().forEach(service => {
        const option = document.createElement('option');
        option.value = service;
        option.textContent = service;
        serviceFilter.appendChild(option);
      });
    }
    
    // Add event listener to telehealth filter form
    const filterForm = document.getElementById('telehealthFilters');
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const service = document.getElementById('serviceFilter').value;
        const searchTerm = document.getElementById('telehealthSearch').value;
        const appointmentRequired = document.querySelector('input[name="appointmentRequired"]:checked')?.value;
        
        this.displayServices({
          service: service,
          searchTerm: searchTerm,
          appointmentRequired: appointmentRequired === 'required' ? true : 
                               appointmentRequired === 'not-required' ? false : undefined
        });
      });
      
      // Add event listener for reset button
      const resetButton = document.getElementById('resetTelehealthFilters');
      if (resetButton) {
        resetButton.addEventListener('click', () => {
          filterForm.reset();
          this.displayServices();
        });
      }
    }
    
    // Real-time search if needed
    const searchInput = document.getElementById('telehealthSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        // Debounce implementation for performance
        clearTimeout(searchInput.debounceTimer);
        searchInput.debounceTimer = setTimeout(() => {
          const service = document.getElementById('serviceFilter').value;
          const searchTerm = e.target.value;
          const appointmentRequired = document.querySelector('input[name="appointmentRequired"]:checked')?.value;
          
          this.displayServices({
            service: service,
            searchTerm: searchTerm,
            appointmentRequired: appointmentRequired === 'required' ? true : 
                                appointmentRequired === 'not-required' ? false : undefined
          });
        }, 300);
      });
    }
    
    // View saved services button
    const viewSavedBtn = document.getElementById('viewSavedTelehealth');
    if (viewSavedBtn) {
      viewSavedBtn.addEventListener('click', () => {
        this.displaySavedServices();
      });
    }
  },
  
  // Display saved telehealth services
  displaySavedServices: function() {
    try {
      // Get saved services
      const savedServices = JSON.parse(localStorage.getItem('saved-telehealth-services') || '[]');
      
      // Create modal container
      let modalContainer = document.getElementById('savedTelehealthModal');
      if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'savedTelehealthModal';
        modalContainer.className = 'modal';
        document.body.appendChild(modalContainer);
      }
      
      // Generate HTML for saved services
      let savedServicesHtml = '';
      if (savedServices.length === 0) {
        savedServicesHtml = `
          <div class="no-saved-services">
            <i data-feather="info"></i>
            <p>You haven't saved any telehealth services for offline use yet.</p>
          </div>
        `;
      } else {
        savedServicesHtml = `
          <div class="saved-services-list">
            ${savedServices.map(service => `
              <div class="saved-service-item">
                <div class="saved-service-info">
                  <h4>${service.name}</h4>
                  <p>${service.description}</p>
                  <div class="telehealth-detail">
                    <i data-feather="phone"></i>
                    <span>Phone: <a href="tel:${service.phone}" class="telehealth-phone">${service.phone}</a></span>
                  </div>
                </div>
                <div class="saved-service-actions">
                  <button class="btn btn-sm btn-danger remove-saved-service" data-service-id="${service.id}">
                    Remove
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      // Create and populate modal content
      modalContainer.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Saved Telehealth Services</h2>
            <button class="modal-close"><i data-feather="x"></i></button>
          </div>
          <div class="modal-body">
            ${savedServicesHtml}
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="closeSavedServicesModal">Close</button>
          </div>
        </div>
      `;
      
      // Show the modal
      modalContainer.style.display = 'flex';
      
      // Replace feather icons
      feather.replace();
      
      // Add event listeners
      const closeButtons = modalContainer.querySelectorAll('.modal-close, #closeSavedServicesModal');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          modalContainer.style.display = 'none';
        });
      });
      
      // Close modal when clicking outside
      modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
          modalContainer.style.display = 'none';
        }
      });
      
      // Remove saved service button
      const removeButtons = modalContainer.querySelectorAll('.remove-saved-service');
      removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const serviceId = parseInt(e.target.dataset.serviceId);
          this.removeSavedService(serviceId);
          // Refresh saved services modal
          this.displaySavedServices();
        });
      });
    } catch (error) {
      console.error('Error displaying saved telehealth services:', error);
      HealthAccess.showNotification('Error displaying saved services', 'error');
    }
  },
  
  // Remove a service from saved services
  removeSavedService: function(serviceId) {
    try {
      // Get saved services
      let savedServices = JSON.parse(localStorage.getItem('saved-telehealth-services') || '[]');
      
      // Filter out the service to remove
      savedServices = savedServices.filter(s => s.id !== serviceId);
      
      // Save back to localStorage
      localStorage.setItem('saved-telehealth-services', JSON.stringify(savedServices));
      
      HealthAccess.showNotification('Telehealth service removed from saved list', 'success');
    } catch (error) {
      console.error('Error removing saved telehealth service:', error);
      HealthAccess.showNotification('Error removing saved service', 'error');
    }
  }
};

// Initialize the telehealth directory module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the telehealth page
  if (document.getElementById('telehealthContainer')) {
    TelehealthDirectory.init();
  }
});
