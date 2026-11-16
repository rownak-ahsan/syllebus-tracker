// ---------- Storage ----------
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ---------- Tasks ----------
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  tasks.push({ id: Date.now(), text: taskInput.value.trim(), done: false, doneAt: null });
  taskInput.value = '';
  save();
  render();
});

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id);
  t.done = !t.done;
  t.doneAt = t.done ? new Date().toISOString() : null;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function render() {
  taskList.innerHTML = '';
  tasks.forEach((t) => {
    const li = document.createElement('li');
    if (t.done) li.classList.add('done');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = t.done;
    box.onchange = () => toggleTask(t.id);

    const label = document.createElement('span');
    label.textContent = t.text;

    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => deleteTask(t.id);

    li.append(box, label, del);
    taskList.appendChild(li);
  });
  renderStats();
}

// ---------- Progress ----------
function renderStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const count = (from) =>
    tasks.filter((t) => t.done && new Date(t.doneAt) >= from).length;

  document.getElementById('stat-day').textContent = count(startOfDay);
  document.getElementById('stat-week').textContent = count(startOfWeek);
  document.getElementById('stat-month').textContent = count(startOfMonth);
}

// ---------- Timer ----------
const display = document.getElementById('time-display');
const minutesInput = document.getElementById('timer-minutes');
let interval = null;
let endTime = 0;

function showTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  display.textContent = m + ':' + s;
}

document.getElementById('timer-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  clearInterval(interval);
  endTime = Date.now() + Number(minutesInput.value) * 60000;
  interval = setInterval(tick, 250);
  tick();
});

document.getElementById('timer-stop').addEventListener('click', () => {
  clearInterval(interval);
  showTime(Number(minutesInput.value) * 60000);
});

function tick() {
  const left = endTime - Date.now();
  showTime(left);
  if (left <= 0) {
    clearInterval(interval);
    beep();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Time is up!');
    }
  }
}

function beep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.frequency.value = 880;
  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}

// ---------- Start ----------
render();

const syllabus = {
  "রসায়ন 🥽": [
    "ল্যাবরেটরির নিরাপদ ব্যবহার",
    "গুণগত রসায়ন",
    "পরিবেশ রসায়ন"
  ],

  "বাংলা ১ম পত্র": [
    "নব্য লেখকদের প্রতি নিবেদন",
    "অপরিচিতা",
    "বিলাসী",
    "প্রতিদান",
    "সোনার তরী"
  ],

  "বাংলা ২য় পত্র": [
    "বাংলা বানানের নিয়ম",
    "উপসর্গ",
    "ইমেইল ও আবেদন পত্র"
  ],

  "ICT": [
    "ডাটা কমিউনিকেশন",
    "সংখ্যা পদ্ধতি",
    "প্রোগ্রামিং এর ধারণা"
  ],

  "পদার্থবিজ্ঞান": [
    "ভৌত জগৎ ও পরিমাপ",
    "Vector",
    "তাপগতিবিদ্যা",
    "পরমাণু মডেল"
  ],

  "উচ্চতর গণিত": [
    "ম্যাট্রিক্স ও নির্ণায়ক",
    "সরলরেখা",
    "জটিল সংখ্যা",
    "কনিক"
  ],

  "জীববিজ্ঞান": [
    "কোষের গঠন ১ম",
    "প্রাণী বিভিন্নতা ও শ্রেণীবিন্যাস ২য়"
  ],

  "English 1st Paper": [
    "Unit 1",
    "Unit 2"
  ],

  "English Grammar": [
    "Synonyms and Antonyms",
    "Use of Words and Phrases",
    "Pronoun Reference"
  ]
};

// Load saved progress
let completed = JSON.parse(
  localStorage.getItem("syllabusProgress") || "{}"
);

const container = document.getElementById(
  "syllabusContainer"
);

function renderSyllabus() {
  container.innerHTML = "";

  Object.entries(syllabus).forEach(([subject, chapters]) => {
    const card = document.createElement("div");
    card.className = "subject-card";

    const done = chapters.filter(
      (chapter, index) =>
        completed[`${subject}-${index}`]
    ).length;

    const percent = Math.round(
      (done / chapters.length) * 100
    );

    card.innerHTML = `
      <h3>${subject}</h3>
      <p class="subject-progress">
        ${done}/${chapters.length} completed (${percent}%)
      </p>
    `;

    chapters.forEach((chapter, index) => {
      const key = `${subject}-${index}`;

      const label = document.createElement("label");
      label.className = "chapter";

      if (completed[key]) {
        label.classList.add("completed");
      }

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!completed[key];

      const span = document.createElement("span");
      span.textContent = chapter;

      checkbox.addEventListener("change", () => {
        completed[key] = checkbox.checked;

        if (!checkbox.checked) {
          delete completed[key];
        }

        localStorage.setItem(
          "syllabusProgress",
          JSON.stringify(completed)
        );

        renderSyllabus();
      });

      label.append(checkbox, span);
      card.appendChild(label);
    });

    container.appendChild(card);
  });

  updateOverallProgress();
}

function updateOverallProgress() {
  const total = Object.values(syllabus)
    .reduce((sum, chapters) => sum + chapters.length, 0);

  const done = Object.values(syllabus)
    .reduce((sum, chapters, subjectIndex) => {
      const subject = Object.keys(syllabus)[subjectIndex];

      return sum + chapters.filter(
        (_, index) => completed[`${subject}-${index}`]
      ).length;
    }, 0);

  const percent = Math.round((done / total) * 100);

  document.getElementById("overallBar").style.width =
    percent + "%";

  document.getElementById("overallText").textContent =
    `${percent}% Completed (${done}/${total} chapters)`;
}

renderSyllabus();

// ===== ROBO EYES CONTROLLER =====

/* ===== ROBO EYES EXPRESSION ENGINE ===== */


/* ===== ROBO EYES STUDY COMPANION ===== */

const robo = document.getElementById("robo-widget");

const expressions = [
  "happy",
  "curious",
  "neutral",
  "love",
  "surprised",
  "smile",
  "sad"
];

let expressionIndex = 0;
let isStudying = false;
let blinkTimeout;

// Change facial expression
function setExpression(expression) {
  robo.classList.remove(
    ...expressions.map(e => "expr-" + e),
    "expr-thinking"
  );

  robo.classList.add("expr-" + expression);
}

// Automatic expressions every 4 seconds
setInterval(() => {
  if (!isStudying) {
    expressionIndex =
      (expressionIndex + 1) % expressions.length;

    setExpression(expressions[expressionIndex]);
  }
}, 4000);

// Start studying
const startButton = document.getElementById("start-study");

if (startButton) {
  startButton.addEventListener("click", () => {
    isStudying = true;
    setExpression("thinking");
  });
}

// End studying
const stopButton = document.getElementById("stop-study");

if (stopButton) {
  stopButton.addEventListener("click", () => {
    isStudying = false;
    expressionIndex = 0;
    setExpression("happy");
  });
}

// Blink whenever anything is clicked
document.addEventListener("click", () => {

  robo.classList.remove("robo-click-blink");

  clearTimeout(blinkTimeout);

  // Restart blink animation
  void robo.offsetWidth;

  robo.classList.add("robo-click-blink");

  blinkTimeout = setTimeout(() => {
    robo.classList.remove("robo-click-blink");
  }, 160);

});

// Initial expression
setExpression("happy");
