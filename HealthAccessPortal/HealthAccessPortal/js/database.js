/**
 * Database JavaScript
 * Handles data storage and management for the application
 * Uses localStorage for client-side data persistence
 */

// Database module for handling data storage
const HealthDatabase = {
  // Storage keys
  keys: {
    facilities: 'healthcare-facilities',
    educationalResources: 'educational-resources',
    telehealthServices: 'telehealth-services',
    settings: 'healthaccess-settings',
    assessments: 'health-assessments',
    savedResources: 'saved-resources',
    savedTelehealth: 'saved-telehealth-services'
  },
  
  // Database initialization
  init: function() {
    console.log('Initializing HealthAccess database...');
    this.checkStorage();
    console.log('Database initialized');
    
    // Set up events
    this.setupEvents();
  },
  
  // Check local storage availability and size
  checkStorage: function() {
    try {
      // Check if localStorage is available
      if (!window.localStorage) {
        console.error('localStorage is not available in this browser');
        return false;
      }
      
      // Check available storage space
      let storageUsed = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          storageUsed += (localStorage[key].length * 2) / 1024 / 1024; // size in MB
        }
      }
      
      console.log(`Current localStorage usage: ${storageUsed.toFixed(2)} MB`);
      
      // Check if we're approaching the storage limit (typically 5-10MB)
      const storageWarningThreshold = 4; // Warning at 4MB
      if (storageUsed > storageWarningThreshold) {
        console.warn('LocalStorage usage is high. Consider cleaning up old data.');
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking storage:', error);
      return false;
    }
  },
  
  // Get data from local storage
  getData: function(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  },
  
  // Save data to local storage
  saveData: function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      
      // If QuotaExceededError, try to clean up some space
      if (error.name === 'QuotaExceededError') {
        this.handleStorageFullError();
      }
      
      return false;
    }
  },
  
  // Delete data from local storage
  deleteData: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
      return false;
    }
  },
  
  // Clear all application data (dangerous!)
  clearAllData: function() {
    try {
      // Clear only our application keys, not all localStorage
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('All application data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },
  
  // Handle storage full error
  handleStorageFullError: function() {
    console.warn('Storage quota exceeded. Attempting to free up space...');
    
    // Try to remove less critical data first
    // For example, old assessment results
    const assessments = this.getData(this.keys.assessments) || [];
    if (assessments.length > 10) {
      // Keep only the 10 most recent assessments
      assessments.sort((a, b) => new Date(b.date) - new Date(a.date));
      const newAssessments = assessments.slice(0, 10);
      this.saveData(this.keys.assessments, newAssessments);
      console.log('Cleaned up old assessment data');
    }
    
    // Show message to user
    if (typeof HealthAccess !== 'undefined') {
      HealthAccess.showNotification(
        'Storage space is full. Some old data has been removed to make space for new data.',
        'warning'
      );
    }
  },
  
  // Export all user data as JSON file for backup
  exportData: function() {
    try {
      const exportData = {};
      
      // Collect all user data
      Object.entries(this.keys).forEach(([name, key]) => {
        exportData[name] = this.getData(key);
      });
      
      // Create JSON blob
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `healthaccess-data-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  },
  
  // Import data from JSON file
  importData: function(jsonFile) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            
            // Validate the data format
            if (!this.validateImportedData(importedData)) {
              reject(new Error('Invalid data format in the imported file'));
              return;
            }
            
            // Import each data type
            Object.entries(importedData).forEach(([name, data]) => {
              const key = this.keys[name];
              if (key && data) {
                this.saveData(key, data);
              }
            });
            
            console.log('Data successfully imported');
            resolve(true);
          } catch (parseError) {
            console.error('Error parsing imported data:', parseError);
            reject(new Error('Could not parse the imported file. Make sure it is a valid JSON file.'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading the imported file'));
        };
        
        reader.readAsText(jsonFile);
      } catch (error) {
        console.error('Error importing data:', error);
        reject(error);
      }
    });
  },
  
  // Validate imported data format
  validateImportedData: function(data) {
    // Check if the data object contains at least some of our expected keys
    const requiredKeys = ['facilities', 'educationalResources', 'telehealthServices'];
    const hasRequiredKeys = requiredKeys.some(key => key in data);
    
    if (!hasRequiredKeys) {
      console.error('Imported data is missing required keys');
      return false;
    }
    
    // Further validation could be added here
    
    return true;
  },
  
  // Setup event listeners
  setupEvents: function() {
    // Listen for storage events (changes from other tabs/windows)
    window.addEventListener('storage', (event) => {
      console.log('Storage changed:', event.key);
      
      // Handle changes to specific keys
      if (event.key === this.keys.settings) {
        console.log('Settings updated from another tab/window');
        // Reload settings if they've changed
        if (typeof HealthAccess !== 'undefined') {
          HealthAccess.loadSettings();
        }
      }
    });
  },
  
  // Get storage usage statistics
  getStorageStats: function() {
    const stats = {
      items: {},
      totalSize: 0,
      limit: 5, // Approximate limit in MB
      usage: 0
    };
    
    try {
      // Calculate size for each data type
      Object.entries(this.keys).forEach(([name, key]) => {
        const data = localStorage.getItem(key);
        const size = data ? (data.length * 2) / 1024 / 1024 : 0; // size in MB
        stats.items[name] = {
          sizeInMB: size,
          sizeFormatted: `${size.toFixed(2)} MB`,
          count: 0
        };
        
        // Count items if it's an array
        try {
          const parsed = data ? JSON.parse(data) : null;
          if (parsed && Array.isArray(parsed)) {
            stats.items[name].count = parsed.length;
          }
        } catch (e) {
          // Ignore parsing errors
        }
        
        stats.totalSize += size;
      });
      
      // Calculate overall usage percentage
      stats.usage = (stats.totalSize / stats.limit) * 100;
      stats.totalSizeFormatted = `${stats.totalSize.toFixed(2)} MB`;
      stats.usageFormatted = `${stats.usage.toFixed(1)}%`;
      
      return stats;
    } catch (error) {
      console.error('Error calculating storage stats:', error);
      return stats;
    }
  }
};

// Initialize the database when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  HealthDatabase.init();
});
