let todos = JSON.parse(localStorage.getItem('todos')) || [];
let timers = {};

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
      timeUp: false,
      createdAt: Date.now()
    };

    todos.unshift(todo); // Add new tasks to the beginning
    saveTodos();
    renderTodos();
    input.value = '';
  }
}

function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      if (!todo.completed) {
        // Reset timer when marking as complete
        resetTimer(id);
      }
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

function resetTimer(id) {
  stopTimer(id);
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, elapsedTime: 0, timeUp: false };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
}

function setTargetTime(id, hours, minutes, seconds) {
  const totalMilliseconds = (
    (parseInt(hours) || 0) * 3600000 +
    (parseInt(minutes) || 0) * 60000 +
    (parseInt(seconds) || 0) * 1000
  );

  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, targetTime: totalMilliseconds, timeUp: false };
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

    if (todo.targetTime > 0 && elapsedTime >= todo.targetTime && !todo.timeUp) {
      const todoItem = document.querySelector(`[data-id="${id}"]`);
      todoItem.classList.add('time-up');

      const audio = document.getElementById('timerSound');
      audio.play();

      alert(`Time's up for task: ${todo.text}`);

      todos = todos.map(t => {
        if (t.id === id) {
          return { ...t, timeUp: true };
        }
        return t;
      });
      saveTodos();
    }

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

    // Hours input
    const hoursInput = document.createElement('input');
    hoursInput.type = 'number';
    hoursInput.className = 'timer-input';
    hoursInput.placeholder = 'Hr';
    hoursInput.min = 0;

    // Minutes input
    const minutesInput = document.createElement('input');
    minutesInput.type = 'number';
    minutesInput.className = 'timer-input';
    minutesInput.placeholder = 'Min';
    minutesInput.min = 0;
    minutesInput.max = 59;

    // Seconds input
    const secondsInput = document.createElement('input');
    secondsInput.type = 'number';
    secondsInput.className = 'timer-input';
    secondsInput.placeholder = 'Sec';
    secondsInput.min = 0;
    secondsInput.max = 59;

    // Set current values if target time exists
    if (todo.targetTime) {
      const hours = Math.floor(todo.targetTime / 3600000);
      const minutes = Math.floor((todo.targetTime % 3600000) / 60000);
      const seconds = Math.floor((todo.targetTime % 60000) / 1000);

      hoursInput.value = hours;
      minutesInput.value = minutes;
      secondsInput.value = seconds;
    }

    // Update target time when any input changes
    const updateTargetTime = () => {
      setTargetTime(
        todo.id,
        hoursInput.value,
        minutesInput.value,
        secondsInput.value
      );
    };

    hoursInput.onchange = updateTargetTime;
    minutesInput.onchange = updateTargetTime;
    secondsInput.onchange = updateTargetTime;

    const timerDisplay = document.createElement('span');
    timerDisplay.className = 'timer-display';
    timerDisplay.dataset.displayId = todo.id;
    timerDisplay.textContent = formatTime(todo.elapsedTime || 0);

    const timerBtn = document.createElement('button');
    timerBtn.className = `timer-btn ${timers[todo.id] ? 'active' : ''}`;
    timerBtn.textContent = timers[todo.id] ? 'Stop Timer' : 'Start Timer';
    timerBtn.dataset.timerId = todo.id;
    timerBtn.onclick = () => toggleTimer(todo.id);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset-btn';
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = () => resetTimer(todo.id);

    timerContainer.appendChild(hoursInput);
    timerContainer.appendChild(minutesInput);
    timerContainer.appendChild(secondsInput);
    timerContainer.appendChild(timerDisplay);
    timerContainer.appendChild(timerBtn);
    timerContainer.appendChild(resetBtn);

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      const newText = prompt('Edit todo:', todo.text);
      if (newText && newText.trim()) {
        todos = todos.map(t => {
          if (t.id === todo.id) {
            return { ...t, text: newText.trim() };
          }
          return t;
        });
        saveTodos();
        renderTodos();
      }
    };

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

// Initial render
renderTodos();
