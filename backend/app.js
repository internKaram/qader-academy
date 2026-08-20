
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth-routes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
// Commented out: 'routes/activityRoutes.js' has not been created yet and crashes server startup with MODULE_NOT_FOUND
// const activityRoutes = require('./routes/activityRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/progress', progressRoutes);
// app.use('/api/v1/activity', activityRoutes); // Enable once activityRoutes.js is implemented
app.use('/api/v1/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
 