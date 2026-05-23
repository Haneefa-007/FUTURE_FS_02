const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    let dbUrl = process.env.MONGODB_URI;

    if (!dbUrl) {
      console.log('No MONGODB_URI detected in .env. Initializing in-memory MongoDB Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      dbUrl = mongoServer.getUri();
      console.log(`In-memory MongoDB Server running at: ${dbUrl}`);
    }

    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('In-memory MongoDB Server stopped.');
    }
  } catch (error) {
    console.error(`Database disconnection error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
