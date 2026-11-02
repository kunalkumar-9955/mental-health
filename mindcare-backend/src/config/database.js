const mongoose = require('mongoose');

let isConnected = false;
let retryTimer = null;
let retryCount = 0;
const MAX_RETRIES = 20;

const connectDB = () => {
  // Clear any pending retry
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/mindcare',
    {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000,
    }
  )
  .then((conn) => {
    isConnected = true;
    retryCount = 0;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle future disconnections
    mongoose.connection.once('disconnected', () => {
      isConnected = false;
      console.warn('⚠️  MongoDB disconnected. Will retry...');
      scheduleRetry();
    });
  })
  .catch((error) => {
    isConnected = false;
    retryCount++;

    const isIPError =
      error.message.includes('whitelist') ||
      error.message.includes('IP') ||
      error.message.includes('Could not connect') ||
      error.message.includes('ECONNREFUSED');

    if (retryCount === 1) {
      console.error('\n❌ MongoDB connection failed!');
      if (isIPError) {
        console.error('   Reason: Your IP is not whitelisted in MongoDB Atlas.');
        console.error('   Fix:');
        console.error('   1. Open https://cloud.mongodb.com');
        console.error('   2. Go to your cluster → Network Access');
        console.error('   3. Click "+ ADD IP ADDRESS"');
        console.error('   4. Click "ALLOW ACCESS FROM ANYWHERE" → Confirm\n');
      } else {
        console.error(`   Error: ${error.message.slice(0, 120)}\n`);
      }
    }

    scheduleRetry();
  });
};

const scheduleRetry = () => {
  if (retryCount >= MAX_RETRIES) {
    console.error('❌ Max MongoDB retries reached. Restart the server after fixing the connection.');
    return;
  }
  const delay = Math.min(retryCount * 5000, 30000);
  console.log(`⏳ MongoDB retry ${retryCount}/${MAX_RETRIES} in ${delay / 1000}s...`);
  retryTimer = setTimeout(connectDB, delay);
};

const getConnectionStatus = () => isConnected;

module.exports = connectDB;
module.exports.getConnectionStatus = getConnectionStatus;
