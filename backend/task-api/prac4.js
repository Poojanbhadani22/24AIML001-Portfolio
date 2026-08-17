const express = require("express");

const app = express();
const port = 5000;


app.use(express.json());


app.use((req, res, next) => {
    console.log(
        `${req.method} ${req.url} - ${new Date().toISOString()}`
    );
    next();
});

let tasks = [
    {
        id: 1,
        title: "24AIML001",
        completed: false
    },
    {
        id: 2,
        title: "Poojan Bhadani",
        completed: false
    }
];

app.get("/tasks", (req, res) => {
    res.status(200).json(tasks);
});

app.post("/tasks", (req, res) => {
    const { title, completed } = req.body;

    if (!title) {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const newTask = {
        id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
        title: title,
        completed: completed || false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const { title, completed } = req.body;

    if (title !== undefined) {
        task.title = title;
    }

    if (completed !== undefined) {
        task.completed = completed;
    }

    res.status(200).json(task);
});


app.delete("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.status(200).json({
        message: "Task deleted successfully",
        task: deletedTask[0]
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        error: "Something went wrong"
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});