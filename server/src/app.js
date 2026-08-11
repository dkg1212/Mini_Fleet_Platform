const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const healthRoutes = require('./routes/healthRoutes');
const rideRoutes = require('./routes/rideRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/rides', rideRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
