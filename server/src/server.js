require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, HOST, () => {
      console.log(`Fleet API listening on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
