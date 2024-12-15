const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());


const TASKS_FILE_PATH = path.join(__dirname, 'tasks.json');


const readTasksFromFile = () => {
    try {
        const data = fs.readFileSync(TASKS_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading tasks file:', err);
        return [];
    }
};


const writeTasksToFile = (tasks) => {
    try {
        fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2));
    } catch (err) {
        console.error('Error writing tasks to file:', err);
    }
};


app.get('/api/tasks', (req, res) => {
    const tasks = readTasksFromFile();
    res.json(tasks);
});


app.get('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const tasks = readTasksFromFile();
    const task = tasks.find(t => t.id === id);

    if (task) {
        res.json(task);
    } else {
        res.status(404).send('Task not found');
    }
});


app.post('/api/tasks', (req, res) => {
    const { name, description, deadline } = req.body;
    if (!name || !description || !deadline) {
        return res.status(400).send('Missing required fields: name, description, deadline');
    }

    const tasks = readTasksFromFile();
    const newTask = {
        id: Date.now().toString(),
        name,
        description,
        deadline
    };
    tasks.push(newTask);
    writeTasksToFile(tasks);
    res.status(201).json(newTask);
});


app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, deadline } = req.body;
    const tasks = readTasksFromFile();

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
        return res.status(404).send('Task not found');
    }

    const updatedTask = {
        ...tasks[taskIndex],
        name: name || tasks[taskIndex].name,
        description: description || tasks[taskIndex].description,
        deadline: deadline || tasks[taskIndex].deadline
    };
    tasks[taskIndex] = updatedTask;
    writeTasksToFile(tasks);
    res.json(updatedTask);
});


app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const tasks = readTasksFromFile();

    const newTasksList = tasks.filter(t => t.id !== id);
    if (newTasksList.length === tasks.length) {
        return res.status(404).send('Task not found');
    }

    writeTasksToFile(newTasksList);
    res.status(204).send(); 
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
