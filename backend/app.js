
const express = require('express');
const cors = require('cors');
 
const authRoutes = require('./routes/auth-routes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const activityRoutes = require('./routes/activityRoutes');
const adminRoutes = require('./routes/adminRoutes'); // stub — see routes/adminRoutes.js
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/activity', activityRoutes);
app.use('/api/v1/admin', adminRoutes);
 
app.get('/', (req, res) => {
  res.send('API is running...');
});
 
module.exports = app;
 