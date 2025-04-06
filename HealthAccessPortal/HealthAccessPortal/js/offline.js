/**
 * Offline JavaScript
 * Handles offline functionality and synchronization
 */

// Offline functionality module
const OfflineManager = {
  // Status tracking
  isOnline: navigator.onLine,
  offlineModeEnabled: false,
  
  // Initialize offline functionality
  init: function() {
    console.log('Initializing offline functionality...');
    
    // Check if offline mode is enabled in settings
    this.loadOfflineSettings();
    
    // Set up event listeners for online/offline status
    this.setupNetworkStatusEvents();
    
    // Update the UI with current status
    this.updateOfflineUI();
    
    console.log('Offline functionality initialized');
  },
  
  // Load offline settings
  loadOfflineSettings: function() {
    try {
      const settings = JSON.parse(localStorage.getItem('healthaccess-settings') || '{}');
      this.offlineModeEnabled = settings.offlineMode || false;
      
      console.log('Offline mode is', this.offlineModeEnabled ? 'enabled' : 'disabled');
    } catch (error) {
      console.error('Error loading offline settings:', error);
      this.offlineModeEnabled = false;
    }
  },
  
  // Set up network status event listeners
  setupNetworkStatusEvents: function() {
    // Listen for online status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Device is now online');
      this.updateOfflineUI();
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('You are now online', 'success');
      }
    });
    
    // Listen for offline status changes
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Device is now offline');
      this.updateOfflineUI();
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('You are now offline. Offline mode enabled.', 'warning');
      }
    });
    
    // Listen for beforeunload to warn about offline changes
    window.addEventListener('beforeunload', (event) => {
      // If we have pending changes and user is trying to close the page
      if (this.hasPendingChanges()) {
        const message = 'You have unsaved changes that will be lost if you leave this page.';
        event.returnValue = message;
        return message;
      }
    });
  },
  
  // Update the UI to reflect offline status
  updateOfflineUI: function() {
    // Add/remove offline class to body
    if (!this.isOnline || this.offlineModeEnabled) {
      document.body.classList.add('offline-mode');
    } else {
      document.body.classList.remove('offline-mode');
    }
    
    // Update offline status indicator if it exists
    const statusIndicator = document.getElementById('offlineStatusIndicator');
    if (statusIndicator) {
      statusIndicator.innerHTML = this.isOnline 
        ? '<i data-feather="wifi"></i> Online'
        : '<i data-feather="wifi-off"></i> Offline';
      
      statusIndicator.className = this.isOnline ? 'status-online' : 'status-offline';
      
      // Replace feather icons
      if (typeof feather !== 'undefined') {
        feather.replace();
      }
    }
    
    // Update offline mode toggle if it exists
    const offlineModeToggle = document.getElementById('offlineModeToggle');
    if (offlineModeToggle) {
      offlineModeToggle.checked = this.offlineModeEnabled;
    }
    
    // Update save offline buttons
    const saveOfflineBtn = document.getElementById('saveOfflineBtn');
    if (saveOfflineBtn) {
      if (this.offlineModeEnabled) {
        saveOfflineBtn.textContent = 'Offline Mode Enabled';
        saveOfflineBtn.disabled = true;
      } else {
        saveOfflineBtn.textContent = 'Save for Offline';
        saveOfflineBtn.disabled = false;
      }
    }
  },
  
  // Enable offline mode
  enableOfflineMode: function() {
    console.log('Enabling offline mode...');
    
    // Update settings
    this.offlineModeEnabled = true;
    
    try {
      // Save to settings
      const settings = JSON.parse(localStorage.getItem('healthaccess-settings') || '{}');
      settings.offlineMode = true;
      localStorage.setItem('healthaccess-settings', JSON.stringify(settings));
      
      // Cache current page
      this.cacheCurrentPage();
      
      // Update UI
      this.updateOfflineUI();
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Offline mode enabled. You can now use the app without internet.', 'success');
      }
      
      return true;
    } catch (error) {
      console.error('Error enabling offline mode:', error);
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Error enabling offline mode', 'error');
      }
      
      return false;
    }
  },
  
  // Disable offline mode
  disableOfflineMode: function() {
    console.log('Disabling offline mode...');
    
    // Update settings
    this.offlineModeEnabled = false;
    
    try {
      // Save to settings
      const settings = JSON.parse(localStorage.getItem('healthaccess-settings') || '{}');
      settings.offlineMode = false;
      localStorage.setItem('healthaccess-settings', JSON.stringify(settings));
      
      // Update UI
      this.updateOfflineUI();
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Offline mode disabled', 'info');
      }
      
      return true;
    } catch (error) {
      console.error('Error disabling offline mode:', error);
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Error disabling offline mode', 'error');
      }
      
      return false;
    }
  },
  
  // Cache the current page for offline use
  cacheCurrentPage: function() {
    // If Cache API is available, use it to store the current page
    if ('caches' in window) {
      const currentPageUrl = window.location.href;
      
      caches.open('healthaccess-pages').then(cache => {
        console.log('Caching current page:', currentPageUrl);
        
        // Cache the current page
        cache.add(currentPageUrl)
          .then(() => {
            console.log('Current page cached successfully');
          })
          .catch(error => {
            console.error('Error caching current page:', error);
          });
        
        // Cache essential resources for the app to work offline
        const essentialResources = [
          '/',
          '/index.html',
          '/css/styles.css',
          '/css/responsive.css',
          '/js/app.js',
          '/js/database.js',
          '/js/offline.js'
        ];
        
        // Add page-specific resources
        if (window.location.pathname.includes('/map.html')) {
          essentialResources.push('/js/map.js');
        } else if (window.location.pathname.includes('/education.html')) {
          essentialResources.push('/js/resources.js');
        } else if (window.location.pathname.includes('/assessment.html')) {
          essentialResources.push('/js/assessment.js');
        } else if (window.location.pathname.includes('/telehealth.html')) {
          essentialResources.push('/js/telehealth.js');
        }
        
        // Cache all essential resources
        cache.addAll(essentialResources)
          .then(() => {
            console.log('Essential resources cached successfully');
          })
          .catch(error => {
            console.error('Error caching essential resources:', error);
          });
      });
    } else {
      console.warn('Cache API not available in this browser');
    }
  },
  
  // Check if there are pending changes that need to be synced
  hasPendingChanges: function() {
    // In this implementation, we're not actually syncing with a server
    // But we could track changes made while offline here
    return false;
  },
  
  // Register event listeners for offline functionality buttons
  registerEventListeners: function() {
    // Offline mode toggle
    const offlineModeToggle = document.getElementById('offlineModeToggle');
    if (offlineModeToggle) {
      offlineModeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.enableOfflineMode();
        } else {
          this.disableOfflineMode();
        }
      });
    }
    
    // Save for offline button
    const saveOfflineBtn = document.getElementById('saveOfflineBtn');
    if (saveOfflineBtn) {
      saveOfflineBtn.addEventListener('click', () => {
        this.enableOfflineMode();
      });
    }
    
    // Cache all pages button
    const cacheAllBtn = document.getElementById('cacheAllPages');
    if (cacheAllBtn) {
      cacheAllBtn.addEventListener('click', () => {
        this.cacheAllPages();
      });
    }
    
    // Clear cache button
    const clearCacheBtn = document.getElementById('clearCache');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => {
        this.clearCache();
      });
    }
  },
  
  // Cache all main pages in the app
  cacheAllPages: function() {
    if ('caches' in window) {
      const pagesToCache = [
        '/',
        '/index.html',
        '/pages/map.html',
        '/pages/education.html',
        '/pages/assessment.html',
        '/pages/telehealth.html',
        '/pages/settings.html'
      ];
      
      // Cache CSS and JS files
      const resourcesToCache = [
        '/css/styles.css',
        '/css/responsive.css',
        '/js/app.js',
        '/js/database.js',
        '/js/offline.js',
        '/js/map.js',
        '/js/resources.js',
        '/js/assessment.js',
        '/js/telehealth.js'
      ];
      
      // Combine all resources to cache
      const allResources = [...pagesToCache, ...resourcesToCache];
      
      caches.open('healthaccess-pages').then(cache => {
        console.log('Caching all pages...');
        
        // Show progress notification
        if (typeof HealthAccess !== 'undefined') {
          HealthAccess.showNotification('Caching all pages for offline use...', 'info');
        }
        
        // Cache all resources
        cache.addAll(allResources)
          .then(() => {
            console.log('All pages cached successfully');
            
            // Show success notification
            if (typeof HealthAccess !== 'undefined') {
              HealthAccess.showNotification('All pages cached for offline use', 'success');
            }
          })
          .catch(error => {
            console.error('Error caching all pages:', error);
            
            // Show error notification
            if (typeof HealthAccess !== 'undefined') {
              HealthAccess.showNotification('Error caching pages: ' + error.message, 'error');
            }
          });
      });
    } else {
      console.warn('Cache API not available in this browser');
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Your browser does not support offline caching', 'warning');
      }
    }
  },
  
  // Clear all cached pages
  clearCache: function() {
    if ('caches' in window) {
      console.log('Clearing all caches...');
      
      // Show progress notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Clearing cached data...', 'info');
      }
      
      // Clear all caches
      caches.delete('healthaccess-pages')
        .then(success => {
          console.log('Cache cleared:', success);
          
          // Show success notification
          if (typeof HealthAccess !== 'undefined') {
            HealthAccess.showNotification('Cached data cleared successfully', 'success');
          }
        })
        .catch(error => {
          console.error('Error clearing cache:', error);
          
          // Show error notification
          if (typeof HealthAccess !== 'undefined') {
            HealthAccess.showNotification('Error clearing cache: ' + error.message, 'error');
          }
        });
    } else {
      console.warn('Cache API not available in this browser');
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Your browser does not support cache clearing', 'warning');
      }
    }
  },
  
  // Get storage usage information
  getStorageUsage: function() {
    return new Promise((resolve, reject) => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate()
          .then(estimate => {
            const usage = {
              usedBytes: estimate.usage,
              totalBytes: estimate.quota,
              usedMB: (estimate.usage / 1024 / 1024).toFixed(2),
              totalMB: (estimate.quota / 1024 / 1024).toFixed(2),
              percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(1)
            };
            
            resolve(usage);
          })
          .catch(error => {
            console.error('Error getting storage estimate:', error);
            reject(error);
          });
      } else {
        reject(new Error('Storage estimation API not available'));
      }
    });
  },
  
  // Check if the current page is cached
  isPageCached: function(url = window.location.href) {
    return new Promise((resolve, reject) => {
      if ('caches' in window) {
        caches.match(url)
          .then(response => {
            resolve(response !== undefined);
          })
          .catch(error => {
            console.error('Error checking if page is cached:', error);
            reject(error);
          });
      } else {
        reject(new Error('Cache API not available'));
      }
    });
  }
};

// Initialize the offline manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  OfflineManager.init();
  OfflineManager.registerEventListeners();
});
