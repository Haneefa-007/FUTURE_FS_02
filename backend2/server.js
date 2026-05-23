require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, disconnectDB } = require('./config/db');
const Admin = require('./models/Admin');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notes', noteRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Mini CRM API is healthy' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
});

// Seed default admin if no admin accounts exist
const seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('No admin accounts found. Creating default admin...');
      await Admin.create({
        username: 'admin',
        email: 'admin@minicrm.com',
        password: 'admin123', // Will be automatically hashed by pre-save hook
      });
      console.log('================================================');
      console.log('Default Admin Account Seeded:');
      console.log('Username: admin');
      console.log('Email:    admin@minicrm.com');
      console.log('Password: admin123');
      console.log('================================================');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error.message);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDefaultAdmin();

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Handle termination signals for clean shutdown of in-memory MongoDB
  const gracefulShutdown = async () => {
    console.log('Received shutdown signal. Closing connections...');
    server.close(async () => {
      console.log('Express HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer();
