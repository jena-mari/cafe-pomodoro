# ☕ Café Pomodoro *₊˚୧

**Café Pomodoro** is a customizable Pomodoro timer paired with a built-in to-do list — perfect for anyone looking to manage tasks effectively while enjoying a cozy, café-inspired atmosphere. Personalize your experience by theming your workspace based on your favorite café drinks!

---

## ✨ Features

- **🍅 Pomodoro Timer**  
  Alternate between focused work sessions, short breaks, and long breaks with ease.

- **📝 To-Do List**  
  Track tasks with interval estimates, and mark them done with a smooth visual transition.

- **⏱ Customizable Timer**  
  Adjust work and break durations to match your workflow from the settings panel.

- **🎨 Drink-Themed Visuals**  
  Choose from five café-inspired themes — coffee, matcha, choco berry, blue lemonade, and ube.

---

## 🛠 Technology Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + custom CSS variables for theming
- **Fonts:** Denton Condensed (display), Urbanist (body) — served from `/fonts`
- **Data Storage:** `localStorage` for timer state, tasks, and theme preference
- **Deployment:** Vercel

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Timer.jsx       # Pomodoro timer with alarm, mode switching, persistence
│   ├── TodoList.jsx    # Task list with interval tracking and done-state styling
│   ├── Settings.jsx    # Theme picker and timer duration controls
│   └── Footer.jsx      # Editable footer (tagline, credit, links)
├── App.jsx             # Root component — theme state, settings wiring
├── main.jsx            # React entry point
└── styles.css          # Theme tokens, layout, card, and component styles
```

**Static assets** (keep these in place):
- `/fonts` — `DentonCondensedTest-Regular.otf`, `DentonCondensedTest-Bold.otf`, `Urbanist-VariableFont_wght.ttf`
- `/components` — theme mug images (`coffee.png`, `matcha.png`, etc.) and `alarm_sound.wav`

---

## 🎨 Theming

Themes are applied as a class on `<html>` (e.g. `html.theme-matcha`) and override CSS variables declared in `src/styles.css`. To adjust colours, edit the relevant block:

```css
html.theme-matcha { --bg:#606C38; --text:#F8EFDA; --card:#F8EFDA; --accent:#606C38; --muted:#F6F2DF }
```

---

## 🌐 Browser Compatibility

Tested on the latest versions of Chrome, Firefox, Safari, and Edge.

---

## 📄 License

© 2025 Jenamari Bathan. All rights reserved.
