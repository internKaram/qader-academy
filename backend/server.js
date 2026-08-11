require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectDatabase');

const courseRouter = require('./routes/course-routes');
const lessonRouter = require('./routes/lesson-routes');

const certificateRoutes = require('./routes/certificateRoutes');
const authRoutes = require('./routes/auth-routes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/admin-routes'); // your addition

const app = express();

// Connect to Database
connectDB();

// Middleware (Stateless)
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/certificates', certificateRoutes);

app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/courses', lessonRouter);

app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/progress', progressRoutes);

app.use('/api/v1/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});