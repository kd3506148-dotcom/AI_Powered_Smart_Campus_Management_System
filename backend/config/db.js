const mongoose = require('mongoose');
const fs = require('fs');

/**
 * Connect to MongoDB database
 * Supports both standard TCP URI and local Unix domain socket
 */
const connectDB = async () => {
  // Candidate connection strings in priority order
  const candidates = [];

  const configuredUri = process.env.MONGO_URI
    ?.trim()
    .replace(/^MONGO_URI\s*=\s*/, '')
    .replace(/^['"]|['"]$/g, '');

  if (configuredUri) {
    if (!/^mongodb(?:\+srv)?:\/\//.test(configuredUri)) {
      throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://');
    }
    candidates.push(configuredUri);
  }

  if (process.env.NODE_ENV !== 'production') {
    // Standard local MongoDB TCP URI for local development and tests.
    candidates.push('mongodb://127.0.0.1:27017/smartcampus_db');
  }

  // Unix domain socket fallback for sandboxed Linux environments
  if (process.env.NODE_ENV !== 'production' && fs.existsSync('/tmp/mongodb-27017.sock')) {
    candidates.push('mongodb://%2Ftmp%2Fmongodb-27017.sock/smartcampus_db');
  }

  let lastError = null;
  for (const uri of candidates) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      lastError = err;
      // Try next candidate
    }
  }

  console.error(`[MongoDB Error]: Could not connect to any MongoDB endpoint.`);
  if (lastError) {
    console.error(`Reason: ${lastError.message}`);
  }
  throw lastError || new Error('Could not connect to MongoDB');
};

module.exports = connectDB;

