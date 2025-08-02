(() => {
  const MODES = {
    POMODORO: 'pomodoro',
    SHORT: 'shortBreak',
    LONG: 'longBreak',
  };

  const POMODOROS_BEFORE_LONG_BREAK = 4;

  const timerDisplay = document.getElementById('time');
  const startBtn = document.getElementById('start-timer');
  const intervalCount = document.getElementById('intervalCount');
  const resetIntervalsBtn = document.getElementById('resetIntervals');
  const soundSelect = document.getElementById('soundSelect');
  const goalProgress = document.getElementById('goalProgress');
  const skipBtn = document.getElementById('skipBtn');
  const modeLabel = document.getElementById('modeLabel');

  const soundMap = {
    alarm: new Audio('alarm_sound.wav'),
    bell: new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg'),
    coffee: new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
  };

  let currentSound = 'alarm';

  let timer, timeLeft, totalTime;
  let isRunning = false;
  let paused = false;
  let pauseTimeLeft = 0;
  let currentMode = localStorage.getItem('cafePomodoro_mode') || MODES.POMODORO;
  let intervalsCompleted = parseInt(localStorage.getItem('cafePomodoro_intervalsCompleted')) || 0;
  let timerDurations = JSON.parse(localStorage.getItem('cafePomodoro_timerDurations')) || {
    pomo: 25,
    short: 5,
    long: 15,
  };

  intervalCount.textContent = intervalsCompleted;

  function updateTime() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  function updateModeLabel(mode) {
    const labels = {
      pomodoro: 'focus time',
      shortBreak: 'short break',
      longBreak: 'long break'
    };
    if (modeLabel) modeLabel.textContent = labels[mode] || '';
  }

  function updateGoalProgress() {
    const pomos = intervalsCompleted % POMODOROS_BEFORE_LONG_BREAK;
    goalProgress.textContent = `progress: ${pomos} / ${POMODOROS_BEFORE_LONG_BREAK} Pomodoros`;
  }

  function setTimeByMode(mode) {
    const durations = {
      pomodoro: timerDurations.pomo * 60,
      shortBreak: timerDurations.short * 60,
      longBreak: timerDurations.long * 60,
    };
    totalTime = durations[mode];
    timeLeft = durations[mode];
  }

  function getNextMode(current, intervalsDone) {
    if (current === MODES.POMODORO) {
      return (intervalsDone % POMODOROS_BEFORE_LONG_BREAK === 0)
        ? MODES.LONG
        : MODES.SHORT;
    }
    return MODES.POMODORO;
  }

  function setMode(mode) {
    currentMode = mode;
    localStorage.setItem('cafePomodoro_mode', mode);
    document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}Btn`)?.classList.add('active');
    setTimeByMode(mode);
    updateTime();
    updateModeLabel(mode);
    updateGoalProgress();
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

          if (currentMode === MODES.POMODORO) {
            intervalsCompleted++;
            localStorage.setItem('cafePomodoro_intervalsCompleted', intervalsCompleted);
            intervalCount.textContent = intervalsCompleted;
            checkTasksCompletion();
          }

          const nextMode = getNextMode(currentMode, intervalsCompleted);

          if (nextMode === MODES.POMODORO && currentMode === MODES.LONG) {
            intervalsCompleted = 0;
            localStorage.setItem('cafePomodoro_intervalsCompleted', intervalsCompleted);
            intervalCount.textContent = intervalsCompleted;
          }

          autoStartNext(nextMode);
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

  function notifyUser() {
    const selectedSound = soundSelect?.value || 'alarm';
    const sound = soundMap[selectedSound];
    sound?.play();

    if (Notification.permission === 'granted') {
      new Notification("⏰ Time's Up!", {
        body: `Switch from ${currentMode}!`,
        icon: '/icon.png'
      });
    }

    const originalTitle = document.title;
    let blink = true;
    const interval = setInterval(() => {
      document.title = blink ? "⏰ TIME'S UP!" : originalTitle;
      blink = !blink;
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      document.title = originalTitle;
    }, 5000);
  }

  function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    paused = false;
    pauseTimeLeft = 0;
    setTimeByMode(currentMode);
    updateTime();
    startBtn.textContent = 'start timer!';
  }

  // --- EVENTS ---
  startBtn.addEventListener('click', startTimer);
  skipBtn?.addEventListener('click', () => {
    clearInterval(timer);
    isRunning = false;
    paused = false;
    pauseTimeLeft = 0;

    if (currentMode === MODES.POMODORO) {
      intervalsCompleted++;
      localStorage.setItem('cafePomodoro_intervalsCompleted', intervalsCompleted);
      intervalCount.textContent = intervalsCompleted;
      checkTasksCompletion();
    }

    const nextMode = getNextMode(currentMode, intervalsCompleted);

    if (nextMode === MODES.POMODORO && currentMode === MODES.LONG) {
      intervalsCompleted = 0;
      localStorage.setItem('cafePomodoro_intervalsCompleted', intervalsCompleted);
      intervalCount.textContent = intervalsCompleted;
    }

    autoStartNext(nextMode);
  });

  soundSelect?.addEventListener('change', () => {
    currentSound = soundSelect.value;
  });

  resetIntervalsBtn.addEventListener('click', () => {
    if (confirm('Reset intervals completed?')) {
      intervalsCompleted = 0;
      localStorage.setItem('cafePomodoro_intervalsCompleted', intervalsCompleted);
      intervalCount.textContent = intervalsCompleted;
      checkTasksCompletion();
    }
  });

  document.getElementById('pomodoroBtn')?.addEventListener('click', () => setMode(MODES.POMODORO));
  document.getElementById('shortBreakBtn')?.addEventListener('click', () => setMode(MODES.SHORT));
  document.getElementById('longBreakBtn')?.addEventListener('click', () => setMode(MODES.LONG));

  // INIT
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  setTimeByMode(currentMode);
  updateTime();
  updateModeLabel(currentMode);
  updateGoalProgress();

  // Optional global for settings icon
  window.resetTimer = resetTimer;
  window.openSettings = () => {
    document.getElementById('settingsPanel').style.display = 'block';
  };
})();
