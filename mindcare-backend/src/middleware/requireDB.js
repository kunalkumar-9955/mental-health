const { getConnectionStatus } = require('../config/database');

/**
 * Middleware that blocks requests when MongoDB is not connected.
 * Returns a clear 503 with instructions to fix the Atlas IP whitelist.
 */
const requireDB = (req, res, next) => {
  if (!getConnectionStatus()) {
    return res.status(503).json({
      error: 'Database not connected.',
      fix: 'Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)',
      url: 'https://cloud.mongodb.com'
    });
  }
  next();
};

module.exports = requireDB;
