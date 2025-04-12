const express = require('express');
const cors=require('cors')// use for sending data from server to front while using fetch in front due to cors policy
const mongoose=require('mongoose');
const app=express();
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // Parse JSON bodies

// Determine the port
const port =process.env.PORT || 3000;
// Start the server
app.listen(port,()=>{
    console.log(`Serverx at http://localhost:${port}`);
})

// MongoDB connection
const mongoURI = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI_ATLAS;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Task Schema
const taskSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Sequential taskId
    content: { type: String, required: true },
  });
  
// Create Task Model
const Task = mongoose.model('Task', taskSchema);

//Helper Function to get the next availabe task ID
const getNextTaskId=async()=>{
  const lastTask =await Task.findOne().sort({id:-1});//sort by id descending to et the last task
  if(!lastTask){
    return 0; //if no tasks are in the collection, start with ID 0
  }
  return lastTask.id+1; //increment the last id
}

// Routes
app.get('/',(req,res)=>{
    res.send("Server is ready...");
})


// Fetch all tasks
app.get('/api/list', async (req, res) => {
    try {
      const tasks = await Task.find(); // Fetch tasks from MongoDB
      res.send(tasks); // Send tasks as response
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Failed to fetch tasks' });
    }
  });


// POST route to add a new task
app.post('/api/add', async (req, res) => {
  try {
    const { content } = req.body;

    // Generate the next available task ID
    const nextId = await getNextTaskId();

    // Create a new task document and save it to MongoDB
    const newTask = new Task({
      id: nextId,
      content: content
    });

    await newTask.save(); // Save to MongoDB

    res.status(201).json({
      message: 'Task added successfully',
      task: newTask
    });
  } catch (err) {
    res.status(500).json({ error: 'Error adding task', details: err });
  }
});
  
  
 // DELETE route to remove a task by taskId
app.delete('/api/list/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findOneAndDelete({ id: id });

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task deleted successfully',
      deletedTask
    });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task', details: err });
  }
  });


  // PUT route to update a task by taskId
app.put('/api/list/:id', async (req, res) => {
    const id = parseInt(req.params.id); // Convert taskId to integer
    const { content } = req.body;
  
    if (!content) {
      return res.status(400).send({ message: 'Task content is required' });
    }
  
    try {
      const updatedTask = await Task.findOneAndUpdate(
        { id: id },
        { content:content },
        { new: true } // Return the updated document
      );
  
      if (!updatedTask) {
        return res.status(404).send({ message: 'Task not found' });
      }
  
      res.send(updatedTask); // Return updated task
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Failed to update task' });
    }
  });