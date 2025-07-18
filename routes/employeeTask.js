const express = require('express');
const router = express.Router();
const EmployeeTask = require('../models/EmployeeTask');
const EmployeeSalary = require('../models/EmployeeSalary');

// Assign a new task
router.post('/assign', async (req, res) => {
  try {
    const { employeeId, task, assignedAt, estimateTime } = req.body;
    const newTask = new EmployeeTask({ employeeId, task });
    if (assignedAt) newTask.assignedAt = new Date(assignedAt);
    if (estimateTime) newTask.estimateTime = estimateTime;
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Complete a task and rate
router.put('/complete/:taskId', async (req, res) => {
  try {
    const { completedAt } = req.body;
    const task = await EmployeeTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status !== 'assigned') return res.status(400).json({ error: 'Task already completed or failed' });
    const assignedTime = task.assignedAt;
    const completedTime = completedAt ? new Date(completedAt) : new Date();
    const diffMs = completedTime - assignedTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    let rating = 1;
    if (task.estimateTime) {
      const percent = (diffHours / task.estimateTime) * 100;
      if (percent <= 20) rating = 5;
      else if (percent <= 30) rating = 4;
      else if (percent >= 75 && percent <= 100) rating = 3;
      else if (percent > 120 && percent <= 150) rating = 2;
      else if (percent > 150) rating = 1;
      else rating = 3; // fallback for 31-74% and 101-120%
    } else {
      if (diffHours < 1) rating = 5;
      else if (diffHours === 1) rating = 4;
      else if (diffHours > 3) rating = 2;
      else rating = 3;
    }
    task.completedAt = completedTime;
    task.rating = rating;
    task.status = 'completed';
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark task as failed
router.put('/fail/:taskId', async (req, res) => {
  try {
    const task = await EmployeeTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.status = 'failed';
    task.rating = 1;
    task.completedAt = new Date();
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update task status
router.put('/status/:taskId', async (req, res) => {
  try {
    const { status, updatedAt } = req.body;
    const task = await EmployeeTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (!['assigned', 'in progress', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    task.status = status;
    if (status === 'completed') {
      const completedTime = updatedAt ? new Date(updatedAt) : new Date();
      task.completedAt = completedTime;
      // Calculate rating as in /complete/:taskId
      const assignedTime = task.assignedAt;
      const diffMs = completedTime - assignedTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      let rating = 1;
      if (diffHours < 1) rating = 5;
      else if (diffHours === 1) rating = 4;
      else if (diffHours > 3) rating = 2;
      else rating = 3;
      task.rating = rating;
    }
    if (status === 'failed') {
      task.completedAt = new Date();
      task.rating = 1;
    }
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Pause a task
router.put('/pause/:taskId', async (req, res) => {
  try {
    const task = await EmployeeTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status !== 'assigned' && task.status !== 'in progress') {
      return res.status(400).json({ error: 'Task cannot be paused' });
    }
    task.status = 'paused';
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Continue a paused task
router.put('/continue/:taskId', async (req, res) => {
  try {
    const task = await EmployeeTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status !== 'paused') {
      return res.status(400).json({ error: 'Task is not paused' });
    }
    task.status = 'in progress';
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks for an employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const tasks = await EmployeeTask.find({ employeeId: req.params.employeeId }).sort({ assignedAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tasks
router.get('/all', async (req, res) => {
  try {
    
    const tasks = await EmployeeTask.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get eligible employees for increment based on 180-day average rating
router.get('/eligible-increments', async (req, res) => {
  try {
    const now = new Date();
    const past180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const tasks = await EmployeeTask.find({ assignedAt: { $gte: past180 }, status: 'completed' });
    const ratingsByEmployee = {};
    tasks.forEach(task => {
      if (!ratingsByEmployee[task.employeeId]) ratingsByEmployee[task.employeeId] = [];
      ratingsByEmployee[task.employeeId].push(task.rating);
    });
    const eligible = [];
    for (const [employeeId, ratings] of Object.entries(ratingsByEmployee)) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      let increment = 0;
      if (avg === 5) increment = 10;
      else if (avg >= 3 && avg < 5) increment = 5;
      else if (avg === 2) increment = 3;
      else if (avg === 1) increment = 0;
      eligible.push({ employeeId, avgRating: avg, increment });
    }
    res.json(eligible);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 