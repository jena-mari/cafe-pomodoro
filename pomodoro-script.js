(() => {
  
let pomodoroDuration = 25 * 60;
let shortBreakDuration = 5 * 60;
let longBreakDuration = 15 * 60;
let currentMode = 'pomodoro';
let timer;
let timeLeft = pomodoroDuration;
let isRunning = false;
let intervalCount = 0;

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const modeButtons = document.querySelectorAll('.mode-btn');
const intervalCounter = document.getElementById('interval-counter');
const resetCounterBtn = document.getElementById('reset-counter-btn');

const settingsPanel = document.getElementById('settings-panel');
const themeButtons = document.querySelectorAll('.theme-btn');

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function switchMode(mode) {
  currentMode = mode;
  clearInterval(timer);
  isRunning = false;
  if (mode === 'pomodoro') timeLeft = pomodoroDuration;
  else if (mode === 'shortBreak') timeLeft = shortBreakDuration;
  else if (mode === 'longBreak') timeLeft = longBreakDuration;
  updateDisplay();
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`${mode}Btn`).classList.add('active');
}

function notifyUser(message) {
  if (Notification.permission === 'granted') {
    new Notification('Pomodoro Timer', { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') new Notification('Pomodoro Timer', { body: message });
    });
  }
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      handleTimerEnd();
    }
  }, 1000);
}

function handleTimerEnd() {
  notifyUser(`Time's up! Switching from ${currentMode}.`);
  if (currentMode === 'pomodoro') {
    intervalCount++;
    intervalCounter.textContent = intervalCount;
    if (intervalCount % 4 === 0) {
      switchMode('longBreak');
    } else {
      switchMode('shortBreak');
    }
  } else {
    switchMode('pomodoro');
  }
  startTimer();
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  switchMode(currentMode);
}

function resetIntervals() {
  const confirmReset = confirm("Are you sure you want to reset completed intervals?");
  if (confirmReset) {
    intervalCount = 0;
    intervalCounter.textContent = intervalCount;
  }
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
  const themeVars = themes[theme];
  for (let key in themeVars) {
    root.style.setProperty(key, themeVars[key]);
  }
}

function switchTheme(themeName) {
  applyTheme(themeName);
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    switchMode(button.getAttribute('data-mode'));
  });
});

themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedTheme = button.getAttribute('data-theme');
    switchTheme(selectedTheme);
  });
});

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
resetCounterBtn.addEventListener('click', resetIntervals);

document.addEventListener('DOMContentLoaded', () => {
  switchMode('pomodoro');
  updateDisplay();
});

  
})();
