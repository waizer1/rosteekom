// ==========================================
//   БАЗА ДАННЫХ УСТРОЙСТВ (5 штук)
// ==========================================
const devicesDB = [
  { id: 'vacuum',  name: 'Робот-пылесос',  icon: '🤖' },
  { id: 'lamp',    name: 'Умная лампочка',  icon: '💡' },
  { id: 'ac',      name: 'Кондиционер',     icon: '❄️' },
  { id: 'speaker', name: 'Умная колонка',    icon: '🔊' },
  { id: 'plug',    name: 'Умная розетка',    icon: '🔌' },
];

// Список добавленных устройств (сохраняется в localStorage)
let addedDevices = JSON.parse(localStorage.getItem('devices')) || [];


// ==========================================
//   ОТРИСОВКА КАРТОЧЕК
// ==========================================
function renderDevices() {
  const grid = document.getElementById('devicesGrid');
  const addBtn = grid.querySelector('.add-btn');

  // Удалить старые карточки
  grid.querySelectorAll('.device-card').forEach(c => c.remove());

  // Создать карточку для каждого добавленного устройства
  addedDevices.forEach(id => {
    const device = devicesDB.find(d => d.id === id);
    if (!device) return;

    const card = document.createElement('div');
    card.className = 'device-card';
    card.onclick = () => openControl(id);
    card.innerHTML = `
      <div class="device-icon">${device.icon}</div>
      <div class="device-name">${device.name}</div>
      <button class="delete-btn" onclick="event.stopPropagation(); removeDevice('${id}')">✕</button>
    `;
    grid.insertBefore(card, addBtn);
  });
}


// ==========================================
//   МОДАЛКА "ДОБАВИТЬ УСТРОЙСТВО"
// ==========================================
function openAddModal() {
  document.getElementById('addModal').classList.add('active');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('searchInput').focus();
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('active');
}

// Поиск по названию
function searchDevice() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const results = document.getElementById('searchResults');
  results.innerHTML = '';

  if (!query) return;

  // Ищем совпадения, исключая уже добавленные
  const found = devicesDB.filter(d =>
    d.name.toLowerCase().includes(query) && !addedDevices.includes(d.id)
  );

  if (found.length === 0) {
    results.innerHTML = '<p class="no-results">Устройство не найдено</p>';
    return;
  }

  found.forEach(device => {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.onclick = () => addDevice(device.id);
    item.innerHTML = `${device.icon} ${device.name}`;
    results.appendChild(item);
  });
}

// Добавить устройство
function addDevice(id) {
  if (!addedDevices.includes(id)) {
    addedDevices.push(id);
    localStorage.setItem('devices', JSON.stringify(addedDevices));
    renderDevices();
  }
  closeAddModal();
}

// Удалить устройство
function removeDevice(id) {
  addedDevices = addedDevices.filter(d => d !== id);
  localStorage.setItem('devices', JSON.stringify(addedDevices));
  renderDevices();
}


// ==========================================
//   МОДАЛКА УПРАВЛЕНИЯ
// ==========================================
function openControl(id) {
  document.getElementById('controlContent').innerHTML = generatePanel(id);
  document.getElementById('controlModal').classList.add('active');
}

function closeControlModal() {
  document.getElementById('controlModal').classList.remove('active');
  clearInterval(plugInterval); // останавливаем симуляцию розетки
}

// Запись в лог
function addLog(logId, message) {
  const log = document.getElementById(logId);
  if (!log) return;
  const time = new Date().toLocaleTimeString();
  log.innerHTML = `<div class="log-entry">⏱ ${time} — ${message}</div>` + log.innerHTML;
}


// ==========================================
//   ГЕНЕРАЦИЯ ПАНЕЛЕЙ УПРАВЛЕНИЯ
// ==========================================
function generatePanel(id) {
  const d = devicesDB.find(d => d.id === id);

  switch (id) {

    // ---------- РОБОТ-ПЫЛЕСОС ----------
    case 'vacuum': return `
      <h2>${d.icon} ${d.name}</h2>
      <div class="control-panel">
        <div class="status" id="vacuumStatus">Статус: Ожидание</div>
        <div class="battery">🔋 Батарея: 87%</div>

        <div class="control-group">
          <label>Режим уборки:</label>
          <div class="btn-group">
            <button class="mode-btn active" onclick="setMode(this, 'vacuumLog', 'Сухая')">Сухая</button>
            <button class="mode-btn" onclick="setMode(this, 'vacuumLog', 'Влажная')">Влажная</button>
            <button class="mode-btn" onclick="setMode(this, 'vacuumLog', 'Турбо')">Турбо</button>
          </div>
        </div>

        <div class="control-group">
          <button class="action-btn start" onclick="toggleVacuum()">▶ Начать уборку</button>
          <button class="action-btn" onclick="vacuumHome()">🏠 На базу</button>
        </div>

        <div class="log" id="vacuumLog"></div>
      </div>`;

    // ---------- УМНАЯ ЛАМПОЧКА ----------
    case 'lamp': return `
      <h2>${d.icon} ${d.name}</h2>
      <div class="control-panel">
        <div class="toggle-group">
          <span>Выкл</span>
          <label class="toggle">
            <input type="checkbox" onchange="addLog('lampLog', this.checked ? 'Включена 💡' : 'Выключена 🌑')">
            <span class="toggle-slider"></span>
          </label>
          <span>Вкл</span>
        </div>

        <div class="control-group">
          <label>Яркость: <span id="brightVal">100</span>%</label>
          <input type="range" min="1" max="100" value="100"
            oninput="document.getElementById('brightVal').textContent = this.value">
        </div>

        <div class="control-group">
          <label>Цвет:</label>
          <div class="color-group">
            <div class="color-btn" style="background:#fff"    onclick="pickColor(this,'Белый')"></div>
            <div class="color-btn" style="background:#ffd700" onclick="pickColor(this,'Тёплый')"></div>
            <div class="color-btn" style="background:#ff4444" onclick="pickColor(this,'Красный')"></div>
            <div class="color-btn" style="background:#4488ff" onclick="pickColor(this,'Синий')"></div>
            <div class="color-btn" style="background:#44dd44" onclick="pickColor(this,'Зелёный')"></div>
          </div>
        </div>

        <div class="log" id="lampLog"></div>
      </div>`;

    // ---------- КОНДИЦИОНЕР ----------
    case 'ac': return `
      <h2>${d.icon} ${d.name}</h2>
      <div class="control-panel">
        <div class="toggle-group">
          <span>Выкл</span>
          <label class="toggle">
            <input type="checkbox" onchange="addLog('acLog', this.checked ? 'Включён ✅' : 'Выключен ⛔')">
            <span class="toggle-slider"></span>
          </label>
          <span>Вкл</span>
        </div>

        <div class="control-group">
          <label>Температура:</label>
          <div class="temp-control">
            <button class="temp-btn" onclick="changeTemp(-1)">−</button>
            <span class="temp-display" id="tempVal">22°C</span>
            <button class="temp-btn" onclick="changeTemp(1)">+</button>
          </div>
        </div>

        <div class="control-group">
          <label>Режим:</label>
          <div class="btn-group">
            <button class="mode-btn active" onclick="setMode(this, 'acLog', 'Охлаждение ❄️')">❄️ Холод</button>
            <button class="mode-btn" onclick="setMode(this, 'acLog', 'Обогрев 🔥')">🔥 Тепло</button>
            <button class="mode-btn" onclick="setMode(this, 'acLog', 'Авто 🔄')">🔄 Авто</button>
          </div>
        </div>

        <div class="log" id="acLog"></div>
      </div>`;

    // ---------- УМНАЯ КОЛОНКА ----------
    case 'speaker': return `
      <h2>${d.icon} ${d.name}</h2>
      <div class="control-panel">
        <div class="now-playing">
          <div class="track-name" id="trackName">🎵 Ничего не играет</div>
        </div>

        <div class="player-controls">
          <button class="player-btn" onclick="switchTrack(-1)">⏮</button>
          <button class="player-btn big" id="playBtn" onclick="togglePlay()">▶</button>
          <button class="player-btn" onclick="switchTrack(1)">⏭</button>
        </div>

        <div class="control-group">
          <label>Громкость: <span id="volVal">50</span>%</label>
          <input type="range" min="0" max="100" value="50"
            oninput="document.getElementById('volVal').textContent = this.value">
        </div>

        <div class="log" id="speakerLog"></div>
      </div>`;

    // ---------- УМНАЯ РОЗЕТКА ----------
    case 'plug': return `
      <h2>${d.icon} ${d.name}</h2>
      <div class="control-panel">
        <div class="toggle-group">
          <span>Выкл</span>
          <label class="toggle">
            <input type="checkbox" onchange="togglePlug(this)">
            <span class="toggle-slider"></span>
          </label>
          <span>Вкл</span>
        </div>

        <div class="power-display">
          <div class="power-value" id="powerVal">0 Вт</div>
          <div class="power-label">Потребление</div>
        </div>

        <div class="control-group">
          <label>Таймер отключения:</label>
          <div class="btn-group">
            <button class="mode-btn" onclick="setMode(this, 'plugLog', 'Таймер: 30 мин')">30 мин</button>
            <button class="mode-btn" onclick="setMode(this, 'plugLog', 'Таймер: 1 час')">1 час</button>
            <button class="mode-btn" onclick="setMode(this, 'plugLog', 'Таймер: 2 часа')">2 часа</button>
          </div>
        </div>

        <div class="log" id="plugLog"></div>
      </div>`;
  }
}


// ==========================================
//   ЛОГИКА УСТРОЙСТВ
// ==========================================

// --- Общее: переключение режимов ---
function setMode(btn, logId, mode) {
  btn.parentElement.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  addLog(logId, `Режим: ${mode}`);
}

// --- Робот-пылесос ---
let vacuumOn = false;

function toggleVacuum() {
  vacuumOn = !vacuumOn;
  document.getElementById('vacuumStatus').textContent =
    vacuumOn ? 'Статус: Уборка...' : 'Статус: Ожидание';
  addLog('vacuumLog', vacuumOn ? 'Уборка начата ✅' : 'Уборка остановлена ⏹');
}

function vacuumHome() {
  vacuumOn = false;
  document.getElementById('vacuumStatus').textContent = 'Статус: Едет на базу...';
  addLog('vacuumLog', 'Возвращается на базу 🏠');
}

// --- Лампочка: выбор цвета ---
function pickColor(btn, color) {
  btn.parentElement.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  addLog('lampLog', `Цвет: ${color}`);
}

// --- Кондиционер: температура ---
let temp = 22;

function changeTemp(delta) {
  temp = Math.min(30, Math.max(16, temp + delta));
  document.getElementById('tempVal').textContent = temp + '°C';
  addLog('acLog', `Температура: ${temp}°C`);
}

// --- Колонка: плеер ---
const tracks = [
  'Imagine Dragons — Believer',
  'Queen — Bohemian Rhapsody',
  'Linkin Park — Numb',
  'AC/DC — Thunderstruck',
  'Nirvana — Smells Like Teen Spirit'
];
let trackIdx = 0;
let playing = false;

function togglePlay() {
  playing = !playing;
  document.getElementById('playBtn').textContent = playing ? '⏸' : '▶';
  document.getElementById('trackName').textContent =
    playing ? `🎵 ${tracks[trackIdx]}` : '🎵 Пауза';
  addLog('speakerLog', playing ? `Играет: ${tracks[trackIdx]}` : 'Пауза');
}

function switchTrack(dir) {
  trackIdx = (trackIdx + dir + tracks.length) % tracks.length;
  if (playing) {
    document.getElementById('trackName').textContent = `🎵 ${tracks[trackIdx]}`;
    addLog('speakerLog', `Играет: ${tracks[trackIdx]}`);
  }
}

// --- Розетка: симуляция потребления ---
let plugInterval;

function togglePlug(checkbox) {
  clearInterval(plugInterval);
  if (checkbox.checked) {
    addLog('plugLog', 'Розетка включена ✅');
    plugInterval = setInterval(() => {
      const w = Math.floor(Math.random() * 200 + 50);
      const el = document.getElementById('powerVal');
      if (el) el.textContent = w + ' Вт';
    }, 1500);
  } else {
    addLog('plugLog', 'Розетка выключена ⛔');
    document.getElementById('powerVal').textContent = '0 Вт';
  }
}


// ==========================================
//   ЗАПУСК
// ==========================================
renderDevices();