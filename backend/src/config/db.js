const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI in the environment.
 * Fails fast and loudly on startup rather than letting the app run half-broken.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Check your .env file.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);

  console.log(`[db] connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err.message);
  });

  return mongoose.connection;
}

module.exports = connectDB;
