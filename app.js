// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path'); // Module to handle file paths
const http = require('http');
const authRoutes = require('./routes/auth');
const User = require('./models/User'); // Import User model

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true })); // Manage sessions

// Set the 'views' directory for HTML files
app.set('views', path.join(__dirname, 'views'));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Set the view engine to 'html'
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Database connection
mongoose.connect('mongodb+srv://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST/YOUR_DB_NAME?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  // Update User documents to reset sessionId and ipAddress
  await User.updateMany({}, { sessionId: null, ipAddress: null });
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

// Route handling
app.use('/', authRoutes); // Use authentication routes

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
