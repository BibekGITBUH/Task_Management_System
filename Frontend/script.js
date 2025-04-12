

 // Function to fetch and display tasks
 function fetchTasks() {
    // Send a GET request to the backend
    fetch('http://localhost:8080/api/list')
      .then(response => {
        console.log(response)
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // Parse the JSON data
      })
      .then(data => {
        console.log(data)
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; // Clear any existing content
  
        // Loop through the tasks and display them
        data.forEach(tasks => {
          const listItem = document.createElement('li');
          console.log(tasks.id)
          listItem.textContent = `Task: ${tasks.content} (ID: ${tasks.id})`;
  
          //create delete button
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.onclick = () => deleteTask(tasks.id);
          listItem.appendChild(deleteButton);
  
           // Create update button
           const updateButton = document.createElement('button');
           updateButton.textContent = 'Update';
           updateButton.onclick = () => showUpdateField(tasks.id, tasks.content);
           listItem.appendChild(updateButton); // Append update button
  
          taskList.appendChild(listItem);
        });
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }
  
  
  const apiBaseURL = 'http://localhost:8080/api';
  // Function to add a new task
  function addTask(content) {
    fetch(`${apiBaseURL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then(response => {
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to add task');
        }
        return response.json();
      })
      .then(() => {
        fetchTasks(); // Refresh the task list
      })
      .catch(error => console.error('Error adding task:', error));
  }
  
   // Function to delete a task by ID
   function deleteTask(taskId) {
    fetch(`${apiBaseURL}/list/${taskId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete task');
        }
        fetchTasks(); // Refresh the task list after deletion
      })
      .catch(error => console.error('Error deleting task:', error));
  }
  
  
   // Function to show update field for a specific task
   function showUpdateField(taskId, currentContent) {
    console.log(taskId+"x")
    if(taskId===0){
      const adjustedTaskId=taskId+1;
      const listItem = document.querySelector(`#taskList li:nth-child(${adjustedTaskId})`);
      if(!listItem) return;
  
    // Clear the current content and add an input field with the current task content
    listItem.innerHTML = `
      <input type="text" value="${currentContent}" id="updateInput-${taskId}" />
      <button onclick="updateTask(${taskId})">Save</button>
      <button onclick="fetchTasks()">Cancel</button>
    `;
    }else{
    const listItem = document.querySelector(`#taskList li:nth-child(${taskId})`); 
    // #taskList  :targets an element with the id of taskList
    //li:         :This targets <li> (list item) elements inside the #taskList element.
    // nth-child(${taskId})        :This is a pseudo-class that selects the nth child element within a parent.
    /*
    If you have a list like this in HTML:
    <ul id="taskList">
    <li>Task 1</li>
    <li>Task 2</li>
    <li>Task 3</li>
    <li>Task 4</li>
    </ul> 
    And taskId is set to 3, the code:
    Would select the 3rd <li> element, which is Task 3 in this case.
    But,
    if taskId is set to 0 then,
    nth-child(0) is invalid, because there is no "zero-th" child
    */
    if(!listItem) return;
  
    // Clear the current content and add an input field with the current task content
    listItem.innerHTML = `
      <input type="text" value="${currentContent}" id="updateInput-${taskId}" />
      <button onclick="updateTask(${taskId})">Save</button>
      <button onclick="fetchTasks()">Cancel</button>
    `;
    }
  }
  
  
  
  // Function to update a task
  function updateTask(taskId) {
    const updateInput = document.getElementById(`updateInput-${taskId}`);
    const updatedContent = updateInput.value.trim();
  
    if (!updatedContent) {
      alert('Task content cannot be empty');
      return;
    }
  
    fetch(`${apiBaseURL}/list/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: updatedContent }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update task');
        }
        return response.json();
      })
      .then(() => {
        fetchTasks(); // Refresh the task list after update
      })
      .catch(error => console.error('Error updating task:', error));
  }
  
  
   // Handle form submission
   document.getElementById('taskForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent page reload
  
    const taskInput = document.getElementById('taskInput');
    const taskContent = taskInput.value.trim();
  
    if (taskContent) {
     console.log("x"+taskContent)
      addTask(taskContent); // Add task
      taskInput.value = ''; // Clear input field
    }
  });
  
  // Fetch tasks when the page loads
  window.onload = fetchTasks;