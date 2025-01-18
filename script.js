let todos = JSON.parse(localStorage.getItem('todos')) || [];
let timers = {};

renderTodos();

function addTodo() {
  const input = document.getElementById('todoInput');
  const todoText = input.value.trim();

  if (todoText) {
    const todo = {
      id: Date.now(),
      text: todoText,
      completed: false,
      elapsedTime: 0,
      targetTime: 0,
      timeUp: false
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    input.value = '';
  }
}

function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  stopTimer(id);
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos();
}

function showEditDialogue(id) {
  const todo = todos.find(todo => todo.id === id);
  const todoText = prompt('Edit todo', todo.text);

  if (todoText) {
    todos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, text: todoText };
      }
      return todo;
    });

    saveTodos();
    renderTodos();
  }
}

function setTargetTime(id, minutes) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, targetTime: minutes * 60 * 1000, timeUp: false };
    }
    return todo;
  });
  saveTodos();
}

function toggleTimer(id) {
  const timerBtn = document.querySelector(`[data-timer-id="${id}"]`);
  const timerDisplay = document.querySelector(`[data-display-id="${id}"]`);

  if (timers[id]) {
    stopTimer(id);
    timerBtn.textContent = 'Start Timer';
    timerBtn.classList.remove('active');
  } else {
    startTimer(id, timerDisplay);
    timerBtn.textContent = 'Stop Timer';
    timerBtn.classList.add('active');
  }
}

function startTimer(id, display) {
  const todo = todos.find(todo => todo.id === id);
  let startTime = Date.now() - (todo.elapsedTime || 0);

  timers[id] = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    display.textContent = formatTime(elapsedTime);

    // Check if target time is reached
    if (todo.targetTime > 0 && elapsedTime >= todo.targetTime && !todo.timeUp) {
      const todoItem = document.querySelector(`[data-id="${id}"]`);
      todoItem.classList.add('time-up');

      // Play sound
      const audio = document.getElementById('timerSound');
      audio.play();

      // Show alert
      alert(`Time's up for task: ${todo.text}`);

      // Mark as time up
      todos = todos.map(t => {
        if (t.id === id) {
          return { ...t, timeUp: true };
        }
        return t;
      });
      saveTodos();
    }

    // Update the todo's elapsed time
    todos = todos.map(t => {
      if (t.id === id) {
        return { ...t, elapsedTime };
      }
      return t;
    });
    saveTodos();
  }, 1000);
}

function stopTimer(id) {
  if (timers[id]) {
    clearInterval(timers[id]);
    delete timers[id];
  }
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
}

function pad(number) {
  return number.toString().padStart(2, '0');
}

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = '';

  todos.forEach(todo => {
    const todoItem = document.createElement('div');
    todoItem.className = `todo-item ${todo.timeUp ? 'time-up' : ''}`;
    todoItem.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.onclick = () => toggleTodo(todo.id);

    const todoText = document.createElement('span');
    todoText.className = `todo-text ${todo.completed ? 'completed' : ''}`;
    todoText.textContent = todo.text;

    const timerContainer = document.createElement('div');
    timerContainer.className = 'timer-container';

    const timeInput = document.createElement('input');
    timeInput.type = 'number';
    timeInput.className = 'timer-input';
    timeInput.placeholder = 'Min';
    timeInput.min = 1;
    timeInput.value = todo.targetTime ? todo.targetTime / (60 * 1000) : '';
    timeInput.onchange = (e) => setTargetTime(todo.id, e.target.value);

    const timerDisplay = document.createElement('span');
    timerDisplay.className = 'timer-display';
    timerDisplay.dataset.displayId = todo.id;
    timerDisplay.textContent = formatTime(todo.elapsedTime || 0);

    const timerBtn = document.createElement('button');
    timerBtn.className = `timer-btn ${timers[todo.id] ? 'active' : ''}`;
    timerBtn.textContent = timers[todo.id] ? 'Stop Timer' : 'Start Timer';
    timerBtn.dataset.timerId = todo.id;
    timerBtn.onclick = () => toggleTimer(todo.id);

    timerContainer.appendChild(timeInput);
    timerContainer.appendChild(timerDisplay);
    timerContainer.appendChild(timerBtn);

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => showEditDialogue(todo.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteTodo(todo.id);

    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoText);
    todoItem.appendChild(timerContainer);
    todoItem.appendChild(editBtn);
    todoItem.appendChild(deleteBtn);
    todoList.appendChild(todoItem);
  });
}

document.getElementById('todoInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addTodo();
  }
});
