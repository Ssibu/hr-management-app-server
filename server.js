const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hr_management';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Basic route
app.get('/', (req, res) => {
  res.send('HR Management API is running');
});

const employeeRoutes = require('./routes/employee');
const hrPolicyRoutes = require('./routes/hrPolicy');
const employeeSalaryRoutes = require('./routes/employeeSalary');
const employeeTaskRoutes = require('./routes/employeeTask');
app.use('/api/employees', employeeRoutes);
app.use('/api/hrpolicies', hrPolicyRoutes);
app.use('/api/employeesalaries', employeeSalaryRoutes);
app.use('/api/employeetasks', employeeTaskRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 