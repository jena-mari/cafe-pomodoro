(() => {
  const timerDisplay = document.getElementById('time');
  const startBtn = document.getElementById('start-timer');
  const intervalCount = document.getElementById('intervalCount');
  const resetIntervalsBtn = document.getElementById('resetIntervals');
  const taskList = document.getElementById('todo-task-list');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const settingsPanel = document.getElementById('settingsPanel');

  const mouseclick = new Audio("https://uploads.sitepoint.com/wp-content/uploads/2023/06/1687569402mixkit-fast-double-click-on-mouse-275.wav");
  const alarmSound = new Audio("alarm_sound.wav");

  let timer;
  let timeLeft;
  let totalTime;
  let isRunning = false;
  let paused = false;
  let pauseTimeLeft = 0;
  let currentMode = localStorage.getItem('cafePomodoro_mode') || 'pomodoro';

  let intervalsCompleted = parseInt(localStorage.getItem('cafePomodoro_intervalsCompleted')) || 0;
  intervalCount.textContent = intervalsCompleted;

  let timerDurations = JSON.parse(localStorage.getItem('cafePomodoro_timerDurations')) || {
    pomo: 25,
    short: 5,
    long: 15,
  };

  const POMODOROS_BEFORE_LONG_BREAK = 4;

  // Format and display time
  function updateTime() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  // Set timer by mode
  function setTimeByMode(mode) {
    const durations = {
      pomodoro: timerDurations.pomo * 60,
      shortBreak: timerDurations.short * 60,
      longBreak: timerDurations.long * 60,
    };
    totalTime = durations[mode];
    timeLeft = durations[mode];
  }

  // Start or pause timer
  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      startBtn.textContent = 'pause timer!';
      const expectedEndTime = Date.now() + (paused ? pauseTimeLeft : timeLeft) * 1000;
      paused = false;

      timer = setInterval(() => {
        const now = Date.now();
        timeLeft = Math.max(0, Math.floor((expectedEndTime - now) / 1000));
        updateTime();

        if (timeLeft <= 0) {
          clearInterval(timer);
          isRunning = false;
          startBtn.textContent = 'start timer!';
          notifyUser();

          if (currentMode === 'pomodoro') {
            intervalsCompleted++;
            localStorage.setItem('cafePomodoro_intervalsCompleted', intervalsCompleted);
            intervalCount.textContent = intervalsCompleted;
            checkTasksCompletion();

            // Auto-switch between breaks based on intervals completed
            if (intervalsCompleted % POMODOROS_BEFORE_LONG_BREAK === 0) {
              autoStartNext('longBreak');
            } else {
              autoStartNext('shortBreak');
            }
          } else {
            // After break, always go to pomodoro
            autoStartNext('pomodoro');
          }
        }
      }, 1000);
    } else {
      clearInterval(timer);
      pauseTimeLeft = timeLeft;
      paused = true;
      isRunning = false;
      startBtn.textContent = 'resume timer!';
    }
  }

  function autoStartNext(nextMode) {
    setMode(nextMode);
    startTimer();
  }

  function setMode(mode) {
    currentMode = mode;
    localStorage.setItem('cafePomodoro_mode', mode);
    document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}Btn`).classList.add('active');
    setTimeByMode(mode);
    updateTime();
  }

  function notifyUser() {
    alarmSound.play();

    if (Notification.permission === 'granted') {
      new Notification("⏰ Time's Up!", {
        body: `Time to switch from ${currentMode}.`,
        icon: '/icon.png'
      });
    }

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

  // Reset intervals count with confirmation alert
  resetIntervalsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the intervals completed?')) {
      intervalsCompleted = 0;
      localStorage.setItem('cafePomodoro_intervalsCompleted', intervalsCompleted);
      intervalCount.textContent = intervalsCompleted;
      checkTasksCompletion();
    }
  });

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

  function saveTasks() {
    const tasks = Array.from(document.querySelectorAll('.todo-row')).map(row => ({
      name: row.querySelector('.task-input').value,
      hours: row.querySelector('.time-input').value,
      status: row.querySelector('.status-select').value
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
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
    saveTasks();
  }

  function createTaskRow(name = '', hours = '', status = 'in progress') {
    const newTask = document.createElement('div');
    newTask.className = 'todo-row';
    if (status === 'completed') newTask.classList.add('completed');

    newTask.innerHTML = `
      <div class="todo-status">
        <select class="status-select">
          <option value="in progress" ${status === 'in progress' ? 'selected' : ''}>in progress</option>
          <option value="completed" ${status === 'completed' ? 'selected' : ''}>completed</option>
        </select>
      </div>
      <div class="todo-task">
        <input type="text" placeholder="Task name" class="task-input" value="${name}" />
      </div>
      <div class="todo-time">
        <input type="number" placeholder="Hours" class="time-input" min="1" value="${hours}" />
      </div>
      <div class="todo-delete">
        <button class="delete-task-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    newTask.querySelector('.delete-task-btn').addEventListener('click', () => {
      newTask.remove();
      saveTasks();
    });

    newTask.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('change', () => {
        newTask.classList.toggle('completed', newTask.querySelector('.status-select').value === 'completed');
        saveTasks();
      });
    });

    return newTask;
  }

  function loadTasks() {
    taskList.innerHTML = '';
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
      const newTask = createTaskRow(task.name, task.hours, task.status);
      taskList.appendChild(newTask);
    });
  }

  addTaskBtn.addEventListener('click', () => {
    const newTask = createTaskRow();
    taskList.appendChild(newTask);
    saveTasks();
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
    localStorage.setItem('cafePomodoro_timerDurations', JSON.stringify(timerDurations));
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

  // Initial load
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  const storedTheme = localStorage.getItem('selectedTheme') || 'coffee';
  applyTheme(storedTheme);
  setTimeByMode(currentMode);
  updateTime();
  loadTasks();
  saveTasks();

  // Optional: resetTimer function called by "reset" icon button (you may add this)
  window.resetTimer = () => {
    clearInterval(timer);
    isRunning = false;
    paused = false;
    pauseTimeLeft = 0;
    setTimeByMode(currentMode);
    updateTime();
    startBtn.textContent = 'start timer!';
  };

  // Optional: openSettings function for gear icon
  window.openSettings = () => {
    settingsPanel.style.display = 'block';
  };
})();
