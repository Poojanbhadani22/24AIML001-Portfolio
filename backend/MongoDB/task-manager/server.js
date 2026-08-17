const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const Task = require("./models/Task");

const app = express();

const PORT = process.env.PORT || 3000;


// ==============================
// Middleware
// ==============================

app.use(express.json());


// ==============================
// MongoDB Connection
// ==============================

console.log("MONGO_URI =", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log("MongoDB Connection Error:", err);
    });


// ==================================================
// 1. POST /tasks
// Create a new task
// ==================================================

app.post("/tasks", async (req, res) => {

    try {

        const task = await Task.create(req.body);

        res.status(201).json(task);

    } catch (err) {

        res.status(400).json({
            message: "Validation Error",
            error: err.message
        });

    }

});


// ==================================================
// 2. GET /tasks
// Get all tasks
// ==================================================

app.get("/tasks", async (req, res) => {

    try {

        const tasks = await Task.find();

        res.status(200).json(tasks);

    } catch (err) {

        res.status(500).json({
            message: "Error fetching tasks",
            error: err.message
        });

    }

});


// ==================================================
// 3. PUT /tasks/:id
// Update a task
// ==================================================

app.put("/tasks/:id", async (req, res) => {

    try {

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.status(200).json(task);

    } catch (err) {

        res.status(400).json({
            message: "Error updating task",
            error: err.message
        });

    }

});


// ==================================================
// 4. DELETE /tasks/:id
// Delete a task
// ==================================================

app.delete("/tasks/:id", async (req, res) => {

    try {

        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.status(200).json({
            message: "Task deleted successfully",
            task: task
        });

    } catch (err) {

        res.status(400).json({
            message: "Error deleting task",
            error: err.message
        });

    }

});


// ==================================================
// 5. GET /tasks/:id
// Supplementary Problem 3
// Get one task by ID with 404 handling
// ==================================================

app.get("/tasks/:id", async (req, res) => {

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.status(200).json(task);

    } catch (err) {

        res.status(400).json({
            message: "Invalid task ID",
            error: err.message
        });

    }

});


// ==================================================
// Start Server
// ==================================================

app.listen(PORT, () => {

    console.log(`Server Running on Port ${PORT}`);

});