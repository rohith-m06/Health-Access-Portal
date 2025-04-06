/**
 * Map JavaScript
 * Handles the interactive map functionality for healthcare facilities
 */

// Map functionality module
const HealthMap = {
  map: null,
  markers: [],
  facilities: [],
  currentPosition: null,
  
  // Initialize the map
  init: function() {
    console.log('Initializing healthcare facilities map...');
    
    // Get the map container element
    const mapContainer = document.getElementById('facilitiesMap');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }
    
    // Create the map centered on a default location (will be updated with user location if available)
    this.map = L.map('facilitiesMap').setView([40.7128, -74.0060], 10);
    
    // Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);
    
    // Try to get user's location
    this.getUserLocation();
    
    // Load healthcare facilities data
    this.loadFacilities();
    
    // Initialize UI components
    this.initUI();
    
    console.log('Map initialized successfully');
  },
  
  // Get user's current location
  getUserLocation: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        position => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          this.currentPosition = [userLat, userLng];
          
          // Center map on user location
          this.map.setView([userLat, userLng], 12);
          
          // Add marker for user location
          const userMarker = L.marker([userLat, userLng], {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: '<i class="user-marker" data-feather="user"></i>',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })
          }).addTo(this.map);
          
          // Create a message for the popup
          userMarker.bindPopup('<strong>Your Location</strong><br>Healthcare facilities shown within 25 miles').openPopup();
          
          // Replace feather icons in the marker
          feather.replace();
          
          // Calculate distance for each facility from user location
          this.calculateDistances();
        },
        // Error callback
        error => {
          console.error('Error getting user location:', error);
          
          // Show error message to user
          if (error.code === 1) { // Permission denied
            HealthAccess.showNotification('Location permission denied. Showing all healthcare facilities.', 'warning');
          } else {
            HealthAccess.showNotification('Unable to determine your location. Showing all healthcare facilities.', 'info');
          }
        }
      );
    } else {
      HealthAccess.showNotification('Geolocation is not supported by your browser. Showing all healthcare facilities.', 'info');
    }
  },
  
  // Load healthcare facilities from localStorage
  loadFacilities: function() {
    try {
      // Get facilities from localStorage
      const facilitiesData = localStorage.getItem('healthcare-facilities');
      if (facilitiesData) {
        this.facilities = JSON.parse(facilitiesData);
        console.log(`Loaded ${this.facilities.length} healthcare facilities`);
        
        // Add facilities to the map
        this.displayFacilities();
      } else {
        console.error('No healthcare facilities data found');
        HealthAccess.showNotification('No healthcare facility data available. Please check your settings.', 'error');
      }
    } catch (error) {
      console.error('Error loading healthcare facilities:', error);
      HealthAccess.showNotification('Error loading healthcare facility data.', 'error');
    }
  },
  
  // Display facilities on the map
  displayFacilities: function(filter = null) {
    // Clear existing markers
    this.clearMarkers();
    
    // Filter facilities if filter is provided
    let facilitiesToDisplay = this.facilities;
    if (filter) {
      facilitiesToDisplay = this.facilities.filter(facility => {
        // Apply filters
        if (filter.type && facility.type !== filter.type) return false;
        if (filter.service && !facility.services.includes(filter.service)) return false;
        if (filter.acceptsMedicaid && !facility.acceptsMedicaid) return false;
        if (filter.acceptsMedicare && !facility.acceptsMedicare) return false;
        if (filter.slidingFeeScale && !facility.slidingFeeScale) return false;
        return true;
      });
    }
    
    // Create facility list in sidebar
    this.updateFacilityList(facilitiesToDisplay);
    
    // Add markers for each facility
    facilitiesToDisplay.forEach(facility => {
      // Skip facilities without valid coordinates
      if (!facility.coordinates || !Array.isArray(facility.coordinates) || facility.coordinates.length !== 2) {
        console.warn(`Facility ${facility.name} has invalid coordinates:`, facility.coordinates);
        return;
      }
      
      // Create marker
      const marker = L.marker(facility.coordinates, {
        icon: L.divIcon({
          className: `facility-marker facility-type-${facility.type.toLowerCase().replace(/\s+/g, '-')}`,
          html: this.getFacilityIcon(facility.type),
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(this.map);
      
      // Create popup content
      const popupContent = this.createFacilityPopup(facility);
      marker.bindPopup(popupContent);
      
      // Add to markers array
      this.markers.push(marker);
    });
    
    // Update marker icons with Feather
    feather.replace();
    
    // Fit map bounds to include all markers if we have markers
    if (this.markers.length > 0) {
      // Create a group for fitting bounds
      const markerGroup = L.featureGroup(this.markers);
      
      // If we have user location, include it in the bounds
      if (this.currentPosition) {
        const userMarker = L.marker(this.currentPosition);
        markerGroup.addLayer(userMarker);
      }
      
      // Fit the map to the bounds with some padding
      this.map.fitBounds(markerGroup.getBounds().pad(0.1));
    } else {
      // If no markers, show message
      HealthAccess.showNotification('No healthcare facilities match your filters.', 'info');
    }
  },
  
  // Clear all markers from the map
  clearMarkers: function() {
    // Remove each marker from the map
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    
    // Reset markers array
    this.markers = [];
  },
  
  // Get appropriate icon for facility type
  getFacilityIcon: function(facilityType) {
    // Return appropriate icon based on facility type
    switch (facilityType.toLowerCase()) {
      case 'hospital':
        return '<i data-feather="home"></i>';
      case 'primary care':
        return '<i data-feather="activity"></i>';
      case 'specialty care':
        return '<i data-feather="heart"></i>';
      case 'mobile clinic':
        return '<i data-feather="truck"></i>';
      case 'pharmacy':
        return '<i data-feather="package"></i>';
      case 'mental health':
        return '<i data-feather="smile"></i>';
      default:
        return '<i data-feather="plus-square"></i>';
    }
  },
  
  // Create popup content for a facility
  createFacilityPopup: function(facility) {
    let distanceText = '';
    if (facility.distance) {
      distanceText = `<div class="facility-distance">${facility.distance.toFixed(1)} miles away</div>`;
    }
    
    // Create services list
    const servicesList = facility.services.map(service => `<li>${service}</li>`).join('');
    
    // Create mobile schedule if it exists
    let scheduleHtml = '';
    if (facility.mobileSchedule && Array.isArray(facility.mobileSchedule)) {
      scheduleHtml = `
        <div class="mobile-schedule">
          <h4>Mobile Schedule:</h4>
          <ul>
            ${facility.mobileSchedule.map(item => `
              <li>
                <strong>${item.day}:</strong> ${item.location} (${item.time})
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    
    // Create insurance badges
    const insuranceBadges = `
      <div class="insurance-badges">
        ${facility.acceptsMedicaid ? '<span class="badge badge-medicaid">Medicaid</span>' : ''}
        ${facility.acceptsMedicare ? '<span class="badge badge-medicare">Medicare</span>' : ''}
        ${facility.slidingFeeScale ? '<span class="badge badge-sliding-fee">Sliding Fee</span>' : ''}
      </div>
    `;
    
    // Create popup HTML
    return `
      <div class="facility-popup">
        <h3>${facility.name}</h3>
        <div class="facility-type">${facility.type}</div>
        ${distanceText}
        
        <div class="facility-details">
          <div class="facility-address">
            <i data-feather="map-pin"></i> ${facility.address}
          </div>
          <div class="facility-phone">
            <i data-feather="phone"></i> <a href="tel:${facility.phone}">${facility.phone}</a>
          </div>
          <div class="facility-hours">
            <i data-feather="clock"></i> ${facility.hours}
          </div>
        </div>
        
        ${insuranceBadges}
        
        <div class="facility-services">
          <h4>Services:</h4>
          <ul>
            ${servicesList}
          </ul>
        </div>
        
        ${scheduleHtml}
        
        <div class="facility-actions">
          <a href="https://maps.google.com/?q=${facility.address}" class="btn btn-sm btn-secondary" target="_blank" rel="noopener">Directions</a>
        </div>
      </div>
    `;
  },
  
  // Update the facility list in the sidebar
  updateFacilityList: function(facilities) {
    const facilityList = document.getElementById('facilityList');
    if (!facilityList) return;
    
    // Clear the list
    facilityList.innerHTML = '';
    
    // Sort facilities by distance if available
    if (facilities.some(f => f.distance !== undefined)) {
      facilities.sort((a, b) => {
        // Handle undefined distances
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }
    
    // Create list items for each facility
    facilities.forEach(facility => {
      const listItem = document.createElement('div');
      listItem.className = 'facility-list-item';
      
      // Add distance if available
      let distanceText = '';
      if (facility.distance !== undefined) {
        distanceText = `<span class="distance">${facility.distance.toFixed(1)} miles</span>`;
      }
      
      // Create insurance badges
      const insuranceBadges = `
        <div class="insurance-badges-sm">
          ${facility.acceptsMedicaid ? '<span class="badge-sm badge-medicaid">Medicaid</span>' : ''}
          ${facility.acceptsMedicare ? '<span class="badge-sm badge-medicare">Medicare</span>' : ''}
          ${facility.slidingFeeScale ? '<span class="badge-sm badge-sliding-fee">Sliding Fee</span>' : ''}
        </div>
      `;
      
      // Set the item content
      listItem.innerHTML = `
        <div class="facility-icon">${this.getFacilityIcon(facility.type)}</div>
        <div class="facility-info">
          <h4>${facility.name}</h4>
          <div class="facility-type-sm">${facility.type}</div>
          <div class="facility-address-sm">${facility.address}</div>
          ${insuranceBadges}
        </div>
        ${distanceText}
      `;
      
      // Add click event to fly to this facility on the map
      listItem.addEventListener('click', () => {
        // Fly to location
        this.map.flyTo(facility.coordinates, 15);
        
        // Find and open the popup for this facility
        this.markers.forEach(marker => {
          const latLng = marker.getLatLng();
          if (latLng.lat === facility.coordinates[0] && latLng.lng === facility.coordinates[1]) {
            marker.openPopup();
          }
        });
      });
      
      // Add to the list
      facilityList.appendChild(listItem);
    });
    
    // Replace icons
    feather.replace();
  },
  
  // Calculate distances from user's location
  calculateDistances: function() {
    if (!this.currentPosition) return;
    
    const [userLat, userLng] = this.currentPosition;
    
    // Calculate distance for each facility
    this.facilities.forEach(facility => {
      if (facility.coordinates && Array.isArray(facility.coordinates) && facility.coordinates.length === 2) {
        // Calculate distance in kilometers
        const distanceKm = HealthAccess.calculateDistance(
          userLat, userLng,
          facility.coordinates[0], facility.coordinates[1]
        );
        
        // Convert to miles (1 km = 0.621371 miles)
        facility.distance = distanceKm * 0.621371;
      }
    });
    
    // Redisplay facilities with distances
    this.displayFacilities();
  },
  
  // Initialize UI elements and event handlers
  initUI: function() {
    // Filter controls
    const filterForm = document.getElementById('facilityFilters');
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get filter values
        const filterType = document.getElementById('filterType').value;
        const filterService = document.getElementById('filterService').value;
        const filterMedicaid = document.getElementById('filterMedicaid').checked;
        const filterMedicare = document.getElementById('filterMedicare').checked;
        const filterSlidingFee = document.getElementById('filterSlidingFee').checked;
        
        // Create filter object
        const filter = {
          type: filterType || null,
          service: filterService || null,
          acceptsMedicaid: filterMedicaid,
          acceptsMedicare: filterMedicare,
          slidingFeeScale: filterSlidingFee
        };
        
        // Apply filters
        this.displayFacilities(filter);
      });
      
      // Reset filters button
      const resetButton = document.getElementById('resetFilters');
      if (resetButton) {
        resetButton.addEventListener('click', () => {
          filterForm.reset();
          this.displayFacilities();
        });
      }
    }
    
    // Locate me button
    const locateButton = document.getElementById('locateMe');
    if (locateButton) {
      locateButton.addEventListener('click', () => {
        this.getUserLocation();
      });
    }
  }
};

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the map page
  if (document.getElementById('facilitiesMap')) {
    HealthMap.init();
  }
});
