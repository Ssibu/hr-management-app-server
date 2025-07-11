const express = require('express');
const router = express.Router();
const EmployeeSalary = require('../models/EmployeeSalary');

// Get all salary increments
router.get('/', async (req, res) => {
  try {
    const salaries = await EmployeeSalary.find();
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single salary increment by ID
router.get('/:id', async (req, res) => {
  try {
    const salary = await EmployeeSalary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: 'Salary record not found' });
    res.json(salary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new salary increment
router.post('/', async (req, res) => {
  try {
    const newSalary = new EmployeeSalary(req.body);
    await newSalary.save();
    res.status(201).json(newSalary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update salary increment
router.put('/:id', async (req, res) => {
  try {
    const updated = await EmployeeSalary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Salary record not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete salary increment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await EmployeeSalary.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Salary record not found' });
    res.json({ message: 'Salary record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 