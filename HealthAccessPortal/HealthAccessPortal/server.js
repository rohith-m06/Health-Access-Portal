/**
 * HealthAccess Server
 * Provides backend functionality for the HealthAccess application
 */

// Import required modules
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const { WebSocketServer, WebSocket } = require('ws');
require('dotenv').config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '/')));

// Set up Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Set up WebSocket Server on /ws path
const wss = new WebSocketServer({ 
  server: server,
  path: '/ws'
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'notification',
    message: 'Connected to HealthAccess WebSocket server',
    notificationType: 'success',
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('WebSocket message received:', data);
      
      // Process different message types
      switch(data.type) {
        case 'join':
          // Broadcast new user joined notification
          broadcastWebSocket({
            type: 'notification',
            message: `${data.name || 'A user'} joined HealthAccess`,
            notificationType: 'info',
            timestamp: new Date().toISOString()
          }, ws);
          break;
          
        case 'chat':
          // Broadcast chat message to all clients
          broadcastWebSocket({
            type: 'chat',
            message: data.message,
            name: data.name || 'Anonymous',
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'resource':
          // Broadcast shared resource to all clients
          broadcastWebSocket({
            type: 'resource',
            resource: data.resource,
            timestamp: new Date().toISOString()
          });
          break;
          
        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Helper function to broadcast to all WebSocket clients
function broadcastWebSocket(data, exclude = null) {
  wss.clients.forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle user joining
  socket.on('join', (userData) => {
    console.log('User joined:', userData);
    
    // Broadcast to others that a new user has joined
    socket.broadcast.emit('user-joined', {
      id: socket.id,
      ...userData
    });
  });
  
  // Handle chat messages
  socket.on('message', (messageData) => {
    console.log('Message received:', messageData);
    
    // Broadcast message to all clients
    io.emit('message', {
      id: socket.id,
      ...messageData,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle resource sharing
  socket.on('share-resource', (resourceData) => {
    console.log('Resource shared:', resourceData);
    
    // Broadcast shared resource to all clients
    io.emit('resource-shared', {
      id: socket.id,
      ...resourceData,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle location sharing
  socket.on('share-location', (locationData) => {
    console.log('Location shared:', locationData);
    
    // Broadcast location to all clients
    io.emit('location-shared', {
      id: socket.id,
      ...locationData,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    io.emit('user-left', socket.id);
  });
});

// Define API routes
// GET healthcare facilities
app.get('/api/healthcare-facilities', (req, res) => {
  // In a real application, this would fetch from a database
  // For this demo, we'll return the sample data
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
    // (more facilities would be here)
  ];
  
  res.json(healthcareFacilities);
});

// GET educational resources
app.get('/api/educational-resources', (req, res) => {
  // Sample educational resources
  const educationalResources = [
    {
      id: 1,
      title: "Understanding Preventive Care",
      category: "Preventive Health",
      description: "Learn about the importance of preventive health measures and regular check-ups.",
      content: "Preventive care is the care you receive to prevent illnesses or diseases...",
      downloadable: true,
      language: "English",
      readingLevel: "Basic"
    },
    // (more resources would be here)
  ];
  
  res.json(educationalResources);
});

// GET telehealth services
app.get('/api/telehealth-services', (req, res) => {
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
    // (more services would be here)
  ];
  
  res.json(telehealthServices);
});

// Define a route for generating access links
app.post('/api/generate-link', (req, res) => {
  const { userName, purpose } = req.body;
  
  // Generate a unique ID for the link
  const linkId = Math.random().toString(36).substring(2, 15);
  
  // In a real application, you would store this in a database
  // For this demo, we'll just return the link
  const accessLink = `${req.protocol}://${req.get('host')}?access=${linkId}&user=${encodeURIComponent(userName || 'guest')}`;
  
  res.json({
    success: true,
    accessLink,
    linkId
  });
});

// Create a route for the shareable access link
app.get('/access/:linkId', (req, res) => {
  const { linkId } = req.params;
  
  // In a real application, you would validate this link ID against a database
  // For this demo, we'll just send the user to the home page
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the simplified MVP link generator
app.get('/mvp-link', (req, res) => {
  res.sendFile(path.join(__dirname, 'mvp-link.html'));
});

// Simple API for MVP link generation
app.post('/api/generate-mvp-link', (req, res) => {
  const { userName, location, purpose } = req.body;
  
  // Generate a simple ID for the link
  const timestamp = new Date().getTime();
  const token = Buffer.from(`${userName}-${timestamp}`).toString('base64')
    .replace(/=/g, '');
  
  // Create the MVP link
  const accessLink = `${req.protocol}://${req.get('host')}?access=${token}&user=${encodeURIComponent(userName || 'guest')}`;
  
  // Add optional parameters
  let finalLink = accessLink;
  if (purpose) {
    finalLink += `&purpose=${encodeURIComponent(purpose)}`;
  }
  if (location) {
    finalLink += `&location=${encodeURIComponent(location)}`;
  }
  
  res.json({
    success: true,
    accessLink: finalLink,
    token
  });
});

// No AI endpoints

// Default route - send the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Set the port for the server
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`HealthAccess server running on port ${PORT}`);
  console.log(`Access the app at: http://localhost:${PORT}`);
  console.log(`For sharing, use the Replit URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});