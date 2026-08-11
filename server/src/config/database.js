const mongoose = require('mongoose');

const getMongoUri = () => process.env.MONGO_URI || process.env.MONGODB_URI;

const connectDB = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connectDB,
  disconnectDB,
  getMongoUri
};

