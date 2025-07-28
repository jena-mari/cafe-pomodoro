(() => {
  const timerDisplay = document.getElementById('time');
  const startBtn = document.getElementById('start-timer');
  const intervalCount = document.getElementById('intervalCount');
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

  function updateTime() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
    updateProgress();
  }

  function updateProgress() {
    const progress = document.getElementById('timer-progress');
    if (progress) progress.value = totalTime - timeLeft;
  }

  function setTimeByMode(mode) {
    const durations = {
      pomodoro: timerDurations.pomo * 60,
      shortBreak: timerDurations.short * 60,
      longBreak: timerDurations.long * 60,
    };
    totalTime = durations[mode];
    timeLeft = durations[mode];
    const progress = document.getElementById('timer-progress');
    if (progress) {
      progress.max = totalTime;
    }
  }

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
            autoStartNext('shortBreak');
          } else {
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

  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  const storedTheme = localStorage.getItem('selectedTheme') || 'coffee';
  applyTheme(storedTheme);
  setTimeByMode(currentMode);
  updateTime();
  loadTasks();
  saveTasks();
})();
