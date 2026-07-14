require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectDatabase');

const app = express();

// Connect to Database
connectDB();

// Middleware (Stateless)
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});