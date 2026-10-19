
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cache = require('./utils/cache');

const taskEvents = require('./events');
require('./listeners');

require("dotenv").config({ path: __dirname + "/.env" });

const Task = require("./models/Task");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// ------------------------------
// MongoDB Connection
// ------------------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) =>
        console.error("MongoDB Connection Error:", err.message)
    );

// ------------------------------
// Authentication Middleware
// ------------------------------
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. Please provide a token."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
}

// ------------------------------
// Task Input Validation
// ------------------------------
function validateTask(req, res, next) {
    const { title, completed } = req.body;

    if (req.method === "POST") {
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Title is required."
            });
        }
    }

    if (req.method === "PUT") {
        if (title !== undefined &&
            (typeof title !== "string" || !title.trim())) {
            return res.status(400).json({
                message: "Title must be a non-empty string."
            });
        }

        if (completed !== undefined &&
            typeof completed !== "boolean") {
            return res.status(400).json({
                message: "Completed must be true or false."
            });
        }

        if (title === undefined && completed === undefined) {
            return res.status(400).json({
                message: "Provide a title or completed field."
            });
        }
    }

    next();
}

// ------------------------------
// POST /register
// ------------------------------
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            typeof password !== "string" ||
            password.length < 6
        ) {
            return res.status(400).json({
                message: "Provide a valid email and a password of at least 6 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        return res.status(500).json({
            message: "Registration failed."
        });
    }
});

// ------------------------------
// POST /login
// ------------------------------
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({
            message: "Login failed."
        });
    }
});

// ------------------------------
// GET /me
// ------------------------------
app.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({
            message: "Could not fetch user."
        });
    }
});

// ------------------------------
// Protect all task routes
// ------------------------------
app.use("/tasks", authMiddleware);

// POST /tasks

app.post('/tasks', validateTask, async (req, res, next) => {
    try {
        const task = await Task.create(req.body);

        // Practical 9: invalidate cached task list
        cache.del('all_tasks');

        console.log(`[API] Response sent at ${new Date().toISOString()}`);

        res.status(201).json(task);

        // Practical 10: emit after responding
        taskEvents.emit('task-created', task);
    } catch (error) {
        next(error);
    }
});


// GET /tasks
app.get('/tasks', async (req, res, next) => {
    try {
        const cachedTasks = cache.get('all_tasks');

        if (cachedTasks !== undefined) {
            console.log('Cache HIT: all_tasks');
            return res.json(cachedTasks);
        }

        console.log('Cache MISS: all_tasks');

        const tasks = await Task.find();

        cache.set('all_tasks', tasks);

        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

// PUT /tasks/:id
app.put("/tasks/:id", validateTask, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json(task);
    } catch (err) {
        return res.status(400).json({
            message: "Error updating task",
            error: err.message
        });
    }
});

// DELETE /tasks/:id

app.delete("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Practical 9: Invalidate cache after successful deletion
        cache.del("all_tasks");
        cache.del(`task:${req.params.id}`);

        // Practical 10: Log the deletion asynchronously through EventEmitter
        console.log(`[API] Delete response sent at ${new Date().toISOString()}`);

        res.status(200).json({
            message: "Task deleted successfully",
            task
        });

        taskEvents.emit("task-deleted", task);

    } catch (err) {
        return res.status(400).json({
            message: "Error deleting task"
        });
    }
});


// GET /tasks/:id
app.get("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json(task);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }
});

// ------------------------------
// 404 and error handling
// ------------------------------
app.use((req, res) => {
    res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
