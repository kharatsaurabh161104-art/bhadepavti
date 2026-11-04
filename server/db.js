const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

let memoryServer = null;
const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  mongoose.set('strictQuery', true);

  const isDefaultLocal = !MONGODB_URI || MONGODB_URI.includes('127.0.0.1:27017') || MONGODB_URI.includes('localhost:27017');

  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: isDefaultLocal ? 2000 : 10000,
      });

      const { host, name } = mongoose.connection;
      console.log(`[MongoDB] Connected to ${host}/${name}`);
      return;
    } catch (err) {
      if (!isDefaultLocal) {
        throw err;
      }
      console.log(`[MongoDB] Local MongoDB at ${MONGODB_URI} not found, starting embedded MongoDB engine...`);
    }
  }

  // Fallback to embedded MongoDB with persistence in ./data/mongodb
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbDir = path.resolve(__dirname, '..', 'data', 'mongodb');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath: dbDir,
        storageEngine: 'wiredTiger',
        dbName: 'bhadepavti',
      },
    });

    const uri = memoryServer.getUri() + 'bhadepavti';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    const { host, name } = mongoose.connection;
    console.log(`[MongoDB Embedded] Connected to ${host}/${name} (persisted at data/mongodb)`);
  } catch (embeddedErr) {
    console.error('[MongoDB Error] Failed to start embedded MongoDB:', embeddedErr);
    throw embeddedErr;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
