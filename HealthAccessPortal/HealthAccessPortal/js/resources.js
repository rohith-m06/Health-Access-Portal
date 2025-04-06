/**
 * Resources JavaScript
 * Handles educational resources for healthcare
 */

// Educational Resources module
const HealthResources = {
  // Current resources data
  resources: [],
  
  // Categories for filter
  categories: [
    'Preventive Health',
    'Chronic Disease',
    'Pediatric Health',
    'Mental Health',
    'Emergency Care',
    'Women\'s Health',
    'Men\'s Health',
    'Senior Health',
    'Nutrition'
  ],
  
  // Initialize resources functionality
  init: function() {
    console.log('Initializing health resources...');
    
    // Load resources from localStorage
    this.loadResources();
    
    // Initialize UI components
    this.initUI();
    
    console.log('Health resources initialized');
  },
  
  // Load resources from localStorage
  loadResources: function() {
    try {
      // Get resources from localStorage
      const resourcesData = localStorage.getItem('educational-resources');
      if (resourcesData) {
        this.resources = JSON.parse(resourcesData);
        console.log(`Loaded ${this.resources.length} educational resources`);
        
        // Display resources
        this.displayResources();
      } else {
        console.error('No educational resources data found');
        HealthAccess.showNotification('No educational resources available. Please check your settings.', 'error');
      }
    } catch (error) {
      console.error('Error loading educational resources:', error);
      HealthAccess.showNotification('Error loading educational resources data.', 'error');
    }
  },
  
  // Display resources based on filters
  displayResources: function(filter = {}) {
    const resourcesContainer = document.getElementById('resourcesContainer');
    if (!resourcesContainer) return;
    
    // Filter resources
    let filteredResources = this.resources;
    
    if (filter.category && filter.category !== 'all') {
      filteredResources = filteredResources.filter(resource => resource.category === filter.category);
    }
    
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filteredResources = filteredResources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm) || 
        resource.description.toLowerCase().includes(searchTerm) ||
        resource.content.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filter.readingLevel && filter.readingLevel !== 'all') {
      filteredResources = filteredResources.filter(resource => resource.readingLevel === filter.readingLevel);
    }
    
    // Clear container
    resourcesContainer.innerHTML = '';
    
    // Check if we have resources to display
    if (filteredResources.length === 0) {
      resourcesContainer.innerHTML = `
        <div class="no-resources">
          <i data-feather="book"></i>
          <p>No resources match your filters. Try different criteria.</p>
          <button id="clearFilters" class="btn btn-secondary">Clear Filters</button>
        </div>
      `;
      feather.replace();
      
      // Add event listener to clear filters button
      const clearFiltersBtn = document.getElementById('clearFilters');
      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
          const filterForm = document.getElementById('resourceFilters');
          if (filterForm) {
            filterForm.reset();
          }
          this.displayResources();
        });
      }
      
      return;
    }
    
    // Create resource cards
    filteredResources.forEach(resource => {
      const resourceCard = document.createElement('div');
      resourceCard.className = 'resource-card';
      resourceCard.dataset.resourceId = resource.id;
      
      resourceCard.innerHTML = `
        <div class="resource-card-header">
          <h3>${resource.title}</h3>
          <span class="resource-category">${resource.category}</span>
        </div>
        <div class="resource-card-body">
          <p>${resource.description}</p>
        </div>
        <div class="resource-card-footer">
          <span class="resource-reading-level">Reading Level: ${resource.readingLevel}</span>
          <button class="btn btn-primary view-resource" data-resource-id="${resource.id}">View Resource</button>
        </div>
      `;
      
      resourcesContainer.appendChild(resourceCard);
    });
    
    // Add event listeners to view resource buttons
    const viewButtons = document.querySelectorAll('.view-resource');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const resourceId = parseInt(e.target.dataset.resourceId);
        this.showResourceDetails(resourceId);
      });
    });
  },
  
  // Show resource details in a modal
  showResourceDetails: function(resourceId) {
    // Find the resource
    const resource = this.resources.find(r => r.id === resourceId);
    if (!resource) {
      console.error('Resource not found:', resourceId);
      return;
    }
    
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('resourceModal');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'resourceModal';
      modalContainer.className = 'modal';
      document.body.appendChild(modalContainer);
    }
    
    // Create and populate modal content
    modalContainer.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${resource.title}</h2>
          <button class="modal-close"><i data-feather="x"></i></button>
        </div>
        <div class="modal-body">
          <div class="resource-metadata">
            <span class="resource-category">Category: ${resource.category}</span>
            <span class="resource-reading-level">Reading Level: ${resource.readingLevel}</span>
          </div>
          <div class="resource-content">
            ${this.formatResourceContent(resource.content)}
          </div>
        </div>
        <div class="modal-footer">
          ${resource.downloadable ? 
            `<button id="downloadResource" class="btn btn-secondary">
              <i data-feather="download"></i> Save for Offline
            </button>` : ''}
          <button class="btn btn-primary" id="closeResourceModal">Close</button>
        </div>
      </div>
    `;
    
    // Show the modal
    modalContainer.style.display = 'flex';
    
    // Replace feather icons
    feather.replace();
    
    // Add event listeners
    const closeButtons = modalContainer.querySelectorAll('.modal-close, #closeResourceModal');
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
    
    // Download resource functionality
    const downloadButton = document.getElementById('downloadResource');
    if (downloadButton) {
      downloadButton.addEventListener('click', () => {
        this.downloadResource(resource);
      });
    }
  },
  
  // Format resource content with proper HTML
  formatResourceContent: function(content) {
    // Basic formatting for content - convert line breaks to paragraphs
    const paragraphs = content.split('\n\n');
    return paragraphs.map(p => `<p>${p}</p>`).join('');
  },
  
  // Save resource for offline use
  downloadResource: function(resource) {
    try {
      // Get currently saved resources
      const savedResources = JSON.parse(localStorage.getItem('saved-resources') || '[]');
      
      // Check if resource is already saved
      const alreadySaved = savedResources.some(r => r.id === resource.id);
      if (alreadySaved) {
        HealthAccess.showNotification('This resource is already saved for offline use', 'info');
        return;
      }
      
      // Add to saved resources
      savedResources.push(resource);
      localStorage.setItem('saved-resources', JSON.stringify(savedResources));
      
      HealthAccess.showNotification('Resource saved for offline use', 'success');
    } catch (error) {
      console.error('Error saving resource for offline use:', error);
      HealthAccess.showNotification('Error saving resource', 'error');
    }
  },
  
  // Initialize UI elements and event handlers
  initUI: function() {
    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      // Add "All Categories" option
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'All Categories';
      categoryFilter.appendChild(allOption);
      
      // Add each category
      this.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
      });
    }
    
    // Add event listener to resource filter form
    const filterForm = document.getElementById('resourceFilters');
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const category = document.getElementById('categoryFilter').value;
        const searchTerm = document.getElementById('resourceSearch').value;
        const readingLevel = document.getElementById('readingLevelFilter').value;
        
        this.displayResources({
          category: category,
          searchTerm: searchTerm,
          readingLevel: readingLevel
        });
      });
      
      // Add event listener for reset button
      const resetButton = document.getElementById('resetResourceFilters');
      if (resetButton) {
        resetButton.addEventListener('click', () => {
          filterForm.reset();
          this.displayResources();
        });
      }
    }
    
    // Real-time search if needed
    const searchInput = document.getElementById('resourceSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        // Debounce implementation for performance
        clearTimeout(searchInput.debounceTimer);
        searchInput.debounceTimer = setTimeout(() => {
          const category = document.getElementById('categoryFilter').value;
          const searchTerm = e.target.value;
          const readingLevel = document.getElementById('readingLevelFilter').value;
          
          this.displayResources({
            category: category,
            searchTerm: searchTerm,
            readingLevel: readingLevel
          });
        }, 300);
      });
    }
    
    // View saved resources button
    const viewSavedBtn = document.getElementById('viewSavedResources');
    if (viewSavedBtn) {
      viewSavedBtn.addEventListener('click', () => {
        this.displaySavedResources();
      });
    }
  },
  
  // Display saved resources
  displaySavedResources: function() {
    try {
      // Get saved resources
      const savedResources = JSON.parse(localStorage.getItem('saved-resources') || '[]');
      
      // Create modal container
      let modalContainer = document.getElementById('savedResourcesModal');
      if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'savedResourcesModal';
        modalContainer.className = 'modal';
        document.body.appendChild(modalContainer);
      }
      
      // Generate HTML for saved resources
      let savedResourcesHtml = '';
      if (savedResources.length === 0) {
        savedResourcesHtml = `
          <div class="no-saved-resources">
            <i data-feather="info"></i>
            <p>You haven't saved any resources for offline use yet.</p>
          </div>
        `;
      } else {
        savedResourcesHtml = `
          <div class="saved-resources-list">
            ${savedResources.map(resource => `
              <div class="saved-resource-item">
                <div class="saved-resource-info">
                  <h4>${resource.title}</h4>
                  <span class="resource-category">${resource.category}</span>
                </div>
                <div class="saved-resource-actions">
                  <button class="btn btn-sm btn-primary view-saved-resource" data-resource-id="${resource.id}">
                    View
                  </button>
                  <button class="btn btn-sm btn-danger remove-saved-resource" data-resource-id="${resource.id}">
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
            <h2>Saved Resources</h2>
            <button class="modal-close"><i data-feather="x"></i></button>
          </div>
          <div class="modal-body">
            ${savedResourcesHtml}
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="closeSavedResourcesModal">Close</button>
          </div>
        </div>
      `;
      
      // Show the modal
      modalContainer.style.display = 'flex';
      
      // Replace feather icons
      feather.replace();
      
      // Add event listeners
      const closeButtons = modalContainer.querySelectorAll('.modal-close, #closeSavedResourcesModal');
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
      
      // View saved resource button
      const viewButtons = modalContainer.querySelectorAll('.view-saved-resource');
      viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const resourceId = parseInt(e.target.dataset.resourceId);
          this.showSavedResourceDetails(resourceId);
          modalContainer.style.display = 'none';
        });
      });
      
      // Remove saved resource button
      const removeButtons = modalContainer.querySelectorAll('.remove-saved-resource');
      removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const resourceId = parseInt(e.target.dataset.resourceId);
          this.removeSavedResource(resourceId);
          // Refresh saved resources modal
          this.displaySavedResources();
        });
      });
    } catch (error) {
      console.error('Error displaying saved resources:', error);
      HealthAccess.showNotification('Error displaying saved resources', 'error');
    }
  },
  
  // Show saved resource details
  showSavedResourceDetails: function(resourceId) {
    try {
      // Get saved resources
      const savedResources = JSON.parse(localStorage.getItem('saved-resources') || '[]');
      
      // Find the resource
      const resource = savedResources.find(r => r.id === resourceId);
      if (!resource) {
        console.error('Saved resource not found:', resourceId);
        return;
      }
      
      // Create modal container
      let modalContainer = document.getElementById('resourceModal');
      if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'resourceModal';
        modalContainer.className = 'modal';
        document.body.appendChild(modalContainer);
      }
      
      // Create and populate modal content
      modalContainer.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>${resource.title} (Saved)</h2>
            <button class="modal-close"><i data-feather="x"></i></button>
          </div>
          <div class="modal-body">
            <div class="resource-metadata">
              <span class="resource-category">Category: ${resource.category}</span>
              <span class="resource-reading-level">Reading Level: ${resource.readingLevel}</span>
              <span class="resource-saved-badge">Saved for Offline</span>
            </div>
            <div class="resource-content">
              ${this.formatResourceContent(resource.content)}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-danger" id="removeResource" data-resource-id="${resource.id}">
              <i data-feather="trash-2"></i> Remove from Saved
            </button>
            <button class="btn btn-primary" id="closeResourceModal">Close</button>
          </div>
        </div>
      `;
      
      // Show the modal
      modalContainer.style.display = 'flex';
      
      // Replace feather icons
      feather.replace();
      
      // Add event listeners
      const closeButtons = modalContainer.querySelectorAll('.modal-close, #closeResourceModal');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          modalContainer.style.display = 'none';
        });
      });
      
      // Remove resource button
      const removeButton = document.getElementById('removeResource');
      if (removeButton) {
        removeButton.addEventListener('click', (e) => {
          const resourceId = parseInt(e.target.dataset.resourceId);
          this.removeSavedResource(resourceId);
          modalContainer.style.display = 'none';
        });
      }
      
      // Close modal when clicking outside
      modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
          modalContainer.style.display = 'none';
        }
      });
    } catch (error) {
      console.error('Error showing saved resource details:', error);
      HealthAccess.showNotification('Error showing saved resource', 'error');
    }
  },
  
  // Remove a resource from saved resources
  removeSavedResource: function(resourceId) {
    try {
      // Get saved resources
      let savedResources = JSON.parse(localStorage.getItem('saved-resources') || '[]');
      
      // Filter out the resource to remove
      savedResources = savedResources.filter(r => r.id !== resourceId);
      
      // Save back to localStorage
      localStorage.setItem('saved-resources', JSON.stringify(savedResources));
      
      HealthAccess.showNotification('Resource removed from saved resources', 'success');
    } catch (error) {
      console.error('Error removing saved resource:', error);
      HealthAccess.showNotification('Error removing saved resource', 'error');
    }
  }
};

// Initialize the health resources module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the education page
  if (document.getElementById('resourcesContainer')) {
    HealthResources.init();
  }
});
