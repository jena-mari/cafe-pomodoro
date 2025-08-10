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

  let timer = null;
  let timeLeft = 0;
  let totalTime = 0;
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

            if (intervalsCompleted % POMODOROS_BEFORE_LONG_BREAK === 0) {
              autoStartNext('longBreak');
            } else {
              autoStartNext('shortBreak');
            }
          } else {
            // After break, always return to pomodoro
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
    if (isRunning) {
      clearInterval(timer);
      isRunning = false;
      paused = false;
      pauseTimeLeft = 0;
      startBtn.textContent = 'start timer!';
    }

    currentMode = mode;
    localStorage.setItem('cafePomodoro_mode', mode);

    // Update active class on mode buttons
    document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
    const modeBtn = document.getElementById(`${mode}Btn`);
    if (modeBtn) modeBtn.classList.add('active');

    setTimeByMode(mode);
    updateTime();
  }

  function notifyUser() {
    alarmSound.play();

    if (Notification.permission === 'granted') {
      new Notification("⏰ time's up!", {
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
        '--accent-bg': '#4b5d22',    
        '--btn-bg': '#7a8a4c',           
        '--btn-hover-bg': '#283618',    
        '--text-color': '#283618',
        '--main-bg': '#f5f3ec',
        '--btn-text': '#f5f3ec',
        '--todo-completed-bg': '#e2e6d3',
        '--todo-placeholder-color': '#506635',
        '--todo-add-hover-bg': '#f5f3ec'
      },
      ube: {
        '--accent-bg': '#4b2c62',       
        '--btn-bg': '#915fb3',       
        '--btn-hover-bg': '#4b2c62',    
        '--text-color': '#4b2c62',
        '--main-bg': '#f3e9f7',
        '--btn-text': '#f3e9f7',
        '--todo-completed-bg': '#d9cae6',
        '--todo-placeholder-color': '#4b2c62',
        '--todo-add-hover-bg': '#f8effc'
      },
      citrus: {
        '--accent-bg': '#eb9b00',
        '--btn-bg': '#eb9b00',
        '--btn-hover-bg': '#eb9b00',
        '--text-color': '#eb9b00',
        '--main-bg': '#fff3de',
        '--btn-text': '#fff3de',
        '--todo-completed-bg': '#f1642e',
        '--todo-placeholder-color': '#eb9b00',
        '--todo-add-hover-bg': '#fff3de'
      },
      berry: {
        '--accent-bg': '#b7345d',    
        '--btn-bg': '#d23a57',        
        '--btn-hover-bg': '#a22749',   
        '--text-color': '#a22749',
        '--main-bg': '#fff3de',
        '--btn-text': '#fff3de',
        '--todo-completed-bg': '#fff3de',
        '--todo-placeholder-color': '#b7345d',
        '--todo-add-hover-bg': '#fff3de'
      }
    };
    const selected = themes[theme] || themes.coffee;
    for (const key in selected) {
      root.style.setProperty(key, selected[key]);
    }
  }

  // resetTimer now resets the timer fully based on current mode duration
  window.resetTimer = () => {
    clearInterval(timer);
    isRunning = false;
    paused = false;
    pauseTimeLeft = 0;
    setTimeByMode(currentMode);
    updateTime();
    startBtn.textContent = 'start timer!';
  };

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

  // Mode buttons with safer listeners
  ['pomodoro', 'shortBreak', 'longBreak'].forEach(mode => {
    const btn = document.getElementById(`${mode}Btn`);
    if (btn) {
      btn.addEventListener('click', () => {
        mouseclick.play();
        setMode(mode);
      });
    }
  });

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
    const coffeeBtn = document.querySelector('.theme-btn[data-theme="coffee"]');
    if (coffeeBtn) coffeeBtn.classList.add('active');
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

  // Use direct reference for openSettings if found
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

  // Optional: resetTimer function called by "reset" icon button
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
