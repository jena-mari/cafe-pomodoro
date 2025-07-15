(() => {
  const timerDisplay = document.getElementById('time');
  const startBtn = document.getElementById('start-timer');
  const intervalCount = document.getElementById('intervalCount');
  const taskList = document.getElementById('todo-task-list');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const mouseclick = new Audio("https://uploads.sitepoint.com/wp-content/uploads/2023/06/1687569402mixkit-fast-double-click-on-mouse-275.wav");

  let timer;
  let timeLeft = 25 * 60;
  let isRunning = false;
  let currentMode = 'pomodoro';
  let intervalsCompleted = parseInt(localStorage.getItem('intervalsCompleted')) || 0;
  intervalCount.textContent = intervalsCompleted;

  let timerDurations = JSON.parse(localStorage.getItem('timerDurations')) || {
    pomo: 25,
    short: 5,
    long: 15,
  };

  function updateTime() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  function setTimeByMode(mode) {
    timeLeft = {
      pomodoro: timerDurations.pomo * 60,
      shortBreak: timerDurations.short * 60,
      longBreak: timerDurations.long * 60,
    }[mode];
  }

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      startBtn.textContent = 'stop timer!';
      timer = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTime();
        } else {
          clearInterval(timer);
          isRunning = false;
          startBtn.textContent = 'start timer!';
          notifyUser();

          if (currentMode === 'pomodoro') {
            intervalsCompleted++;
            localStorage.setItem('intervalsCompleted', intervalsCompleted);
            intervalCount.textContent = intervalsCompleted;
            checkTasksCompletion();
            autoStartNext('shortBreak');
          } else {
            autoStartNext('pomodoro');
          }
        }
      }, 1000);
    } else {
      clearInterval(timer);
      isRunning = false;
      startBtn.textContent = 'start timer!';
    }
  }

  function autoStartNext(nextMode) {
    setMode(nextMode);
    startTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    setTimeByMode(currentMode);
    updateTime();
    isRunning = false;
    startBtn.textContent = 'start timer!';
  }

  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}Btn`).classList.add('active');
    setTimeByMode(mode);
    updateTime();
  }

  function notifyUser() {
    const audio = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");
    audio.play();
    let blink = true;
    const originalTitle = document.title;
    const interval = setInterval(() => {
      document.title = blink ? "⏰ TIME'S UP!" : originalTitle;
      blink = !blink;
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      document.title = originalTitle;
    }, 5000);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.style.transition = 'all 0.4s ease';
    const themes = {
      coffee: {
        '--accent-bg': '#73411f',
        '--btn-bg': '#ab7843',
        '--btn-hover-bg': '#73411f',
        '--text-color': '#73411f',
        '--main-bg': '#fff4e6',
        '--btn-text': '#fff4e6',
        '--todo-completed-bg': '#d7bda6',
        '--todo-placeholder-color': '#b4875c',
        '--todo-add-hover-bg': '#f9e4cc'
      },
      matcha: {
        '--accent-bg': '#606c38',
        '--btn-bg': '#a3b18a',
        '--btn-hover-bg': '#283618',
        '--text-color': '#283618',
        '--main-bg': '#fefae0',
        '--btn-text': '#fefae0',
        '--todo-completed-bg': '#d9e6cc',
        '--todo-placeholder-color': '#5c7035',
        '--todo-add-hover-bg': '#f1f3d8'
      },
      ube: {
        '--accent-bg': '#9b86a7',
        '--btn-bg': '#cdb4db',
        '--btn-hover-bg': '#5e548e',
        '--text-color': '#5e548e',
        '--main-bg': '#f3e9f7',
        '--btn-text': '#f3e9f7',
        '--todo-completed-bg': '#e2d1e7',
        '--todo-placeholder-color': '#7e6896',
        '--todo-add-hover-bg': '#f8effc'
      },
      lemonade: {
        '--accent-bg': '#eebe62',
        '--btn-bg': '#ffbe0b',
        '--btn-hover-bg': '#ffbe0b',
        '--text-color': '#ff9f1c',
        '--main-bg': '#fff9e6',
        '--btn-text': '#fff9e6',
        '--todo-completed-bg': '#fff3c7',
        '--todo-placeholder-color': '#c28c00',
        '--todo-add-hover-bg': '#fff8dc'
      },
      berry: {
        '--accent-bg': '#9c0b0a',
        '--btn-bg': '#ff4d4d',
        '--btn-hover-bg': '#7f0000',
        '--text-color': '#7f0000',
        '--main-bg': '#ffe5e5',
        '--btn-text': '#ffe5e5',
        '--todo-completed-bg': '#ffc7c7',
        '--todo-placeholder-color': '#7f0000',
        '--todo-add-hover-bg': '#ffecec'
      }
    };
    const selected = themes[theme] || themes.coffee;
    for (const key in selected) {
      root.style.setProperty(key, selected[key]);
    }
  }

  function checkTasksCompletion() {
    document.querySelectorAll('.todo-row').forEach(row => {
      const timeInput = row.querySelector('.time-input');
      const status = row.querySelector('.status-select');
      if (timeInput && parseInt(timeInput.value) && intervalsCompleted >= parseInt(timeInput.value) * 2) {
        status.value = 'completed';
        row.classList.add('completed');
      }
    });
  }

  function saveTasks() {
    const tasks = Array.from(document.querySelectorAll('.todo-row')).map(row => ({
      name: row.querySelector('.task-input').value,
      hours: row.querySelector('.time-input').value,
      status: row.querySelector('.status-select').value
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
      const newTask = document.createElement('div');
      newTask.className = 'todo-row';
      if (task.status === 'completed') newTask.classList.add('completed');
      newTask.innerHTML = `
        <div class="todo-status">
          <select class="status-select">
            <option value="in progress" ${task.status === 'in progress' ? 'selected' : ''}>in progress</option>
            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>completed</option>
          </select>
        </div>
        <div class="todo-task">
          <input type="text" placeholder="Task name" class="task-input" value="${task.name}" />
        </div>
        <div class="todo-time">
          <input type="number" placeholder="Hours" class="time-input" min="1" value="${task.hours}" />
        </div>
        <div class="todo-delete">
          <button class="delete-task-btn"><i class="fa-solid fa-trash"></i></button>
        </div>`;
      taskList.appendChild(newTask);
    });
  }

  addTaskBtn.addEventListener('click', () => {
    const newTask = document.createElement('div');
    newTask.className = 'todo-row';
    newTask.innerHTML = `
      <div class="todo-status">
        <select class="status-select">
          <option value="in progress" selected>in progress</option>
          <option value="completed">completed</option>
        </select>
      </div>
      <div class="todo-task">
        <input type="text" placeholder="Task name" class="task-input" />
      </div>
      <div class="todo-time">
        <input type="number" placeholder="Hours" class="time-input" min="1" />
      </div>
      <div class="todo-delete">
        <button class="delete-task-btn"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    taskList.appendChild(newTask);
    saveTasks();
  });

  taskList.addEventListener('click', (e) => {
    if (e.target.closest('.delete-task-btn')) {
      const taskRow = e.target.closest('.todo-row');
      taskRow?.remove();
      saveTasks();
    }
  });

  taskList.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-select') || e.target.classList.contains('task-input') || e.target.classList.contains('time-input')) {
      const row = e.target.closest('.todo-row');
      row.classList.toggle('completed', row.querySelector('.status-select').value === 'completed');
      saveTasks();
    }
  });

  document.getElementById('pomodoroBtn').addEventListener('click', () => setMode('pomodoro'));
  document.getElementById('shortBreakBtn').addEventListener('click', () => setMode('shortBreak'));
  document.getElementById('longBreakBtn').addEventListener('click', () => setMode('longBreak'));

  document.getElementById('closeSettings').addEventListener('click', () => {
    settingsPanel.style.display = 'none';
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    timerDurations.pomo = parseInt(document.getElementById('pomodoroInput').value) || 25;
    timerDurations.short = parseInt(document.getElementById('shortBreakInput').value) || 5;
    timerDurations.long = parseInt(document.getElementById('longBreakInput').value) || 15;
    localStorage.setItem('timerDurations', JSON.stringify(timerDurations));
    setTimeByMode(currentMode);
    updateTime();
    settingsPanel.style.display = 'none';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('pomodoroInput').value = 25;
    document.getElementById('shortBreakInput').value = 5;
    document.getElementById('longBreakInput').value = 15;
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.theme-btn[data-theme="coffee"]').classList.add('active');
    localStorage.setItem('selectedTheme', 'coffee');
    applyTheme('coffee');
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedTheme = btn.dataset.theme;
      localStorage.setItem('selectedTheme', selectedTheme);
      applyTheme(selectedTheme);
    });
  });

  startBtn.addEventListener('click', () => {
    mouseclick.play();
    startTimer();
  });

  document.querySelector('.control-icon[onclick="openSettings()"]')?.addEventListener('click', () => {
    settingsPanel.style.display = 'block';
  });

  const storedTheme = localStorage.getItem('selectedTheme') || 'coffee';
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === storedTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  setTimeByMode(currentMode);
  updateTime();
  applyTheme(storedTheme);
  loadTasks();
})();