/**
 * Server Connection JavaScript
 * Handles communication with the server and real-time functionality
 */

const ServerConnection = {
  // Socket.io connection
  socket: null,
  
  // Native WebSocket connection
  webSocket: null,
  
  // Server status
  connected: false,
  
  // Current user information
  currentUser: {
    id: null,
    name: 'Guest',
    location: null
  },
  
  // Initialize server connection
  init: function() {
    console.log('Initializing server connection...');
    
    // Try to connect to the socket.io server
    try {
      // Determine the correct server URL based on environment
      const protocol = window.location.protocol;
      const isSecure = protocol === 'https:';
      const wsProtocol = isSecure ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      // Socket.io URL
      const socketUrl = `${protocol}//${host}`;
      
      // WebSocket URL
      const wsUrl = `${wsProtocol}//${host}/ws`;
      
      // Initialize socket connection
      this.socket = io(socketUrl, {
        reconnectionAttempts: 5,
        timeout: 10000
      });
      
      // Initialize WebSocket connection
      this.initWebSocket(wsUrl);
      
      // Set up socket event listeners
      this.setupSocketListeners();
      
      // Check for user info in URL
      this.checkUrlParameters();
      
      // Update UI with connection status
      this.updateConnectionUI();
      
      console.log('Server connection initialized');
      return true;
    } catch (error) {
      console.error('Error initializing server connection:', error);
      
      // Update UI with connection error
      this.updateConnectionUI(false);
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Error connecting to server. Some features may be limited.', 'error');
      }
      
      return false;
    }
  },
  
  // Initialize native WebSocket connection
  initWebSocket: function(wsUrl) {
    try {
      this.webSocket = new WebSocket(wsUrl);
      
      // WebSocket event listeners
      this.webSocket.onopen = (event) => {
        console.log('WebSocket connection established');
        
        // Send initial message
        this.sendWebSocketMessage({
          type: 'join',
          name: this.currentUser.name
        });
      };
      
      this.webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Handle different message types
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.webSocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.webSocket === null || this.webSocket.readyState === WebSocket.CLOSED) {
            this.initWebSocket(wsUrl);
          }
        }, 5000);
      };
      
      this.webSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  },
  
  // Send a message via WebSocket
  sendWebSocketMessage: function(data) {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(data));
      return true;
    }
    return false;
  },
  
  // Handle incoming WebSocket messages
  handleWebSocketMessage: function(data) {
    switch (data.type) {
      case 'chat':
        // Display chat message
        if (data.message) {
          this.displayMessage({
            text: data.message,
            name: data.name || 'Server',
            timestamp: data.timestamp || new Date().toISOString(),
            id: data.id || 'server'
          });
        }
        break;
        
      case 'notification':
        // Show notification
        if (typeof HealthAccess !== 'undefined' && data.message) {
          HealthAccess.showNotification(data.message, data.notificationType || 'info');
        }
        break;
        
      case 'resource':
        // Handle shared resource
        if (data.resource) {
          this.displaySharedResource(data.resource);
        }
        break;
        
      default:
        console.log('Unhandled WebSocket message type:', data.type);
    }
  },
  
  // Set up socket event listeners
  setupSocketListeners: function() {
    if (!this.socket) return;
    
    // Connection established
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
      this.currentUser.id = this.socket.id;
      
      // Update UI
      this.updateConnectionUI(true);
      
      // Join with user info
      this.joinServer();
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Connected to HealthAccess server', 'success');
      }
    });
    
    // Connection lost
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
      
      // Update UI
      this.updateConnectionUI(false);
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification('Disconnected from server. Some features may be limited.', 'warning');
      }
    });
    
    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connected = false;
      
      // Update UI
      this.updateConnectionUI(false);
    });
    
    // New message received
    this.socket.on('message', (messageData) => {
      console.log('Message received:', messageData);
      
      // Update UI with new message
      this.displayMessage(messageData);
    });
    
    // User joined
    this.socket.on('user-joined', (userData) => {
      console.log('User joined:', userData);
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification(`${userData.name} joined HealthAccess`, 'info');
      }
    });
    
    // User left
    this.socket.on('user-left', (userId) => {
      console.log('User left:', userId);
    });
    
    // Resource shared
    this.socket.on('resource-shared', (resourceData) => {
      console.log('Resource shared:', resourceData);
      
      // Show notification
      if (typeof HealthAccess !== 'undefined') {
        HealthAccess.showNotification(`New resource shared: ${resourceData.title}`, 'info');
      }
      
      // Update UI with shared resource
      this.displaySharedResource(resourceData);
    });
    
    // Location shared
    this.socket.on('location-shared', (locationData) => {
      console.log('Location shared:', locationData);
      
      // Update map if on map page
      if (typeof HealthMap !== 'undefined') {
        HealthMap.addSharedLocation(locationData);
      }
    });
  },
  
  // Join the server with user information
  joinServer: function() {
    if (!this.socket || !this.connected) return;
    
    // Emit join event with user info
    this.socket.emit('join', {
      name: this.currentUser.name,
      location: this.currentUser.location
    });
  },
  
  // Check URL parameters for user info
  checkUrlParameters: function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access');
    const userName = urlParams.get('user');
    
    if (accessToken) {
      console.log('Access token found:', accessToken);
    }
    
    if (userName) {
      this.currentUser.name = decodeURIComponent(userName);
      console.log('User name found:', this.currentUser.name);
    }
  },
  
  // Update UI with connection status
  updateConnectionUI: function(isConnected = this.connected) {
    // Update server status indicator if it exists
    const serverStatusIndicator = document.getElementById('serverStatusIndicator');
    if (serverStatusIndicator) {
      serverStatusIndicator.innerHTML = isConnected 
        ? '<i data-feather="globe"></i> Connected to Server'
        : '<i data-feather="globe-off"></i> Offline Mode';
      
      serverStatusIndicator.className = isConnected ? 'status-online' : 'status-offline';
      
      // Replace feather icons
      if (typeof feather !== 'undefined') {
        feather.replace();
      }
    }
    
    // Add/remove server-connected class to body
    if (isConnected) {
      document.body.classList.add('server-connected');
    } else {
      document.body.classList.remove('server-connected');
    }
    
    // Update UI elements that depend on server connection
    this.updateServerDependentUI(isConnected);
  },
  
  // Update UI elements that depend on server connection
  updateServerDependentUI: function(isConnected) {
    // Find all elements with class .server-dependent
    const serverDependentElements = document.querySelectorAll('.server-dependent');
    
    // Update visibility based on connection status
    serverDependentElements.forEach(element => {
      if (isConnected) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    });
  },
  
  // Send a message to the server
  sendMessage: function(message) {
    if (!this.socket || !this.connected) {
      console.warn('Cannot send message: Not connected to server');
      return false;
    }
    
    // Emit message event
    this.socket.emit('message', {
      text: message,
      name: this.currentUser.name,
      timestamp: new Date().toISOString()
    });
    
    return true;
  },
  
  // Display a message in the UI
  displayMessage: function(messageData) {
    // Find message container if it exists
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    if (messageData.id === this.currentUser.id) {
      messageElement.classList.add('message-own');
    }
    
    // Format timestamp
    const timestamp = new Date(messageData.timestamp).toLocaleTimeString();
    
    // Set message content
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="message-sender">${messageData.name}</span>
        <span class="message-time">${timestamp}</span>
      </div>
      <div class="message-text">${messageData.text}</div>
    `;
    
    // Add to container
    messageContainer.appendChild(messageElement);
    
    // Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
  },
  
  // Share a resource with other users
  shareResource: function(resource) {
    if (!this.socket || !this.connected) {
      console.warn('Cannot share resource: Not connected to server');
      return false;
    }
    
    // Emit share-resource event
    this.socket.emit('share-resource', resource);
    
    return true;
  },
  
  // Display a shared resource in the UI
  displaySharedResource: function(resourceData) {
    // Find shared resources container if it exists
    const sharedResourcesContainer = document.getElementById('sharedResourcesContainer');
    if (!sharedResourcesContainer) return;
    
    // Create resource element
    const resourceElement = document.createElement('div');
    resourceElement.className = 'shared-resource';
    
    // Format timestamp
    const timestamp = new Date(resourceData.timestamp).toLocaleTimeString();
    
    // Set resource content
    resourceElement.innerHTML = `
      <div class="shared-resource-header">
        <h4>${resourceData.title}</h4>
        <div class="shared-by">Shared by ${resourceData.name} at ${timestamp}</div>
      </div>
      <div class="shared-resource-content">
        <p>${resourceData.description || ''}</p>
      </div>
      <div class="shared-resource-actions">
        <button class="btn btn-sm btn-primary view-shared-resource" data-resource-id="${resourceData.id}">
          View Resource
        </button>
      </div>
    `;
    
    // Add to container
    sharedResourcesContainer.prepend(resourceElement);
    
    // Add click event to view button
    const viewButton = resourceElement.querySelector('.view-shared-resource');
    if (viewButton) {
      viewButton.addEventListener('click', () => {
        if (typeof HealthResources !== 'undefined') {
          HealthResources.showResourceDetails(parseInt(resourceData.id));
        }
      });
    }
  },
  
  // Share current location with other users
  shareLocation: function(location) {
    if (!this.socket || !this.connected) {
      console.warn('Cannot share location: Not connected to server');
      return false;
    }
    
    // Update current user location
    this.currentUser.location = location;
    
    // Emit share-location event
    this.socket.emit('share-location', {
      location: location,
      name: this.currentUser.name
    });
    
    return true;
  },
  
  // Generate a shareable access link
  generateAccessLink: function(userName, purpose) {
    return new Promise((resolve, reject) => {
      // If we're not connected to the server, generate a local link
      if (!this.socket || !this.connected) {
        const linkId = Math.random().toString(36).substring(2, 15);
        const accessLink = `${window.location.origin}?access=${linkId}&user=${encodeURIComponent(userName || 'guest')}`;
        
        resolve({
          success: true,
          accessLink,
          linkId,
          note: 'Generated local link (not connected to server)'
        });
        return;
      }
      
      // Send request to server
      fetch('/api/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: userName || this.currentUser.name,
          purpose: purpose || 'access'
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.message || 'Error generating link'));
          }
        })
        .catch(error => {
          console.error('Error generating access link:', error);
          reject(error);
        });
    });
  },
  
  // Copy a link to the clipboard
  copyToClipboard: function(text) {
    // Create temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    
    // Select and copy the text
    tempInput.select();
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(tempInput);
    
    // Show notification
    if (typeof HealthAccess !== 'undefined') {
      HealthAccess.showNotification('Link copied to clipboard', 'success');
    }
    
    return true;
  }
};

// Initialize the server connection when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load Socket.io script dynamically
  const script = document.createElement('script');
  script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
  script.onload = () => {
    // Initialize server connection once Socket.io is loaded
    ServerConnection.init();
  };
  script.onerror = () => {
    console.error('Error loading Socket.io');
  };
  document.body.appendChild(script);
});