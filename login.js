// =====================
//  БАЗА 5 УСТРОЙСТВ
// =====================
var DB = [
  { id: 'vacuum',  name: 'Робот-пылесос', icon: '🤖' },
  { id: 'lamp',    name: 'Умная лампочка', icon: '💡' },
  { id: 'ac',      name: 'Кондиционер',   icon: '❄️' },
  { id: 'speaker', name: 'Умная колонка',  icon: '🔊' },
  { id: 'plug',    name: 'Умная розетка',  icon: '🔌' }
];

// Сохранённые устройства
var saved = JSON.parse(localStorage.getItem('myDevices')) || [];

// Состояния
var vacOn = false;
var acTemp = 22;
var spkPlaying = false;
var spkTrack = 0;
var spkTracks = [
  'Imagine Dragons — Believer',
  'Queen — Bohemian Rhapsody',
  'Linkin Park — Numb',
  'AC/DC — Thunderstruck',
  'Nirvana — Smells Like Teen Spirit'
];
var plugTimer = null;


// =====================
//  РЕНДЕР КАРТОЧЕК
// =====================
function drawCards() {
  var box = document.getElementById('devicesContainer');
  box.innerHTML = '';

  for (var i = 0; i < saved.length; i++) {
    var dev = findDev(saved[i]);
    if (!dev) continue;

    var card = document.createElement('div');
    card.className = 'dev-card';
    card.setAttribute('data-id', dev.id);
    card.innerHTML =
      '<div class="dev-card-icon">' + dev.icon + '</div>' +
      '<div class="dev-card-name">' + dev.name + '</div>' +
      '<button class="dev-card-del" data-id="' + dev.id + '">✕</button>';
    box.appendChild(card);
  }

  // Клик — открыть управление
  var cards = box.querySelectorAll('.dev-card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', function () {
      openControl(this.getAttribute('data-id'));
    });
  }

  // Клик — удалить
  var dels = box.querySelectorAll('.dev-card-del');
  for (var i = 0; i < dels.length; i++) {
    dels[i].addEventListener('click', function (e) {
      e.stopPropagation();
      delDevice(this.getAttribute('data-id'));
    });
  }
}


// =====================
//  ПОИСК
// =====================
function openSearch() {
  document.getElementById('searchModal').classList.add('open');
  document.getElementById('deviceInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  setTimeout(function () {
    document.getElementById('deviceInput').focus();
  }, 100);
}

function closeSearch() {
  document.getElementById('searchModal').classList.remove('open');
}

document.getElementById('searchModal').addEventListener('click', function (e) {
  if (e.target === this) closeSearch();
});

function filterDevices() {
  var q = document.getElementById('deviceInput').value.toLowerCase().trim();
  var box = document.getElementById('searchResults');
  box.innerHTML = '';

  if (!q) return;

  var found = [];
  for (var i = 0; i < DB.length; i++) {
    if (DB[i].name.toLowerCase().indexOf(q) !== -1 && saved.indexOf(DB[i].id) === -1) {
      found.push(DB[i]);
    }
  }

  if (found.length === 0) {
    box.innerHTML = '<p class="search-empty">Ничего не найдено</p>';
    return;
  }

  for (var i = 0; i < found.length; i++) {
    var item = document.createElement('div');
    item.className = 'search-item';
    item.setAttribute('data-id', found[i].id);
    item.textContent = found[i].icon + '  ' + found[i].name;
    item.addEventListener('click', function () {
      addDevice(this.getAttribute('data-id'));
    });
    box.appendChild(item);
  }
}


// =====================
//  ДОБАВИТЬ / УДАЛИТЬ
// =====================
function addDevice(id) {
  if (saved.indexOf(id) === -1) {
    saved.push(id);
    save();
    drawCards();
  }
  closeSearch();
}

function delDevice(id) {
  var arr = [];
  for (var i = 0; i < saved.length; i++) {
    if (saved[i] !== id) arr.push(saved[i]);
  }
  saved = arr;
  save();
  drawCards();
}

function save() {
  localStorage.setItem('myDevices', JSON.stringify(saved));
}


// =====================
//  УПРАВЛЕНИЕ
// =====================
function openControl(id) {
  document.getElementById('controlPanel').innerHTML = buildPanel(id);
  document.getElementById('controlModal').classList.add('open');
}

function closeControl() {
  document.getElementById('controlModal').classList.remove('open');
  if (plugTimer) { clearInterval(plugTimer); plugTimer = null; }
}

document.getElementById('controlModal').addEventListener('click', function (e) {
  if (e.target === this) closeControl();
});

function log(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  var t = new Date().toLocaleTimeString();
  el.innerHTML = '<div class="ctrl-log-item">⏱ ' + t + ' — ' + msg + '</div>' + el.innerHTML;
}

function findDev(id) {
  for (var i = 0; i < DB.length; i++) {
    if (DB[i].id === id) return DB[i];
  }
  return null;
}


// =====================
//  ПАНЕЛИ УПРАВЛЕНИЯ
// =====================
function buildPanel(id) {
  var d = findDev(id);
  if (!d) return '';

  // --- РОБОТ-ПЫЛЕСОС ---
  if (id === 'vacuum') return '' +
    '<h2 class="modal-title">' + d.icon + ' ' + d.name + '</h2>' +
    '<div class="ctrl">' +
      '<div class="ctrl-status" id="vSt">Статус: Ожидание</div>' +
      '<div class="ctrl-battery">🔋 Батарея: 87%</div>' +
      '<div class="ctrl-row">' +
        '<span class="ctrl-label">Режим уборки</span>' +
        '<div class="ctrl-btns">' +
          '<button class="ctrl-mode on" onclick="setM(this,\'vLog\',\'Сухая\')">Сухая</button>' +
          '<button class="ctrl-mode" onclick="setM(this,\'vLog\',\'Влажная\')">Влажная</button>' +
          '<button class="ctrl-mode" onclick="setM(this,\'vLog\',\'Турбо\')">Турбо</button>' +
        '</div>' +
      '</div>' +
      '<button class="ctrl-action green" onclick="togVac()">▶ Начать уборку</button>' +
      '<button class="ctrl-action" onclick="vacHome()">🏠 На базу</button>' +
      '<div class="ctrl-log" id="vLog"></div>' +
    '</div>';

  // --- УМНАЯ ЛАМПОЧКА ---
  if (id === 'lamp') return '' +
    '<h2 class="modal-title">' + d.icon + ' ' + d.name + '</h2>' +
    '<div class="ctrl">' +
      '<div class="ctrl-toggle">' +
        '<span>Выкл</span>' +
        '<label class="sw"><input type="checkbox" onchange="log(\'lLog\',this.checked?\'Включена 💡\':\'Выключена 🌑\')"><span class="sw-rail"></span></label>' +
        '<span>Вкл</span>' +
      '</div>' +
      '<div class="ctrl-row">' +
        '<span class="ctrl-label">Яркость: <span id="brV">100</span>%</span>' +
        '<input type="range" class="ctrl-range" min="1" max="100" value="100" oninput="document.getElementById(\'brV\').textContent=this.value">' +
      '</div>' +
      '<div class="ctrl-row">' +
        '<span class="ctrl-label">Цвет</span>' +
        '<div class="ctrl-colors">' +
          '<div class="ctrl-color" style="background:#fff"    onclick="pickC(this,\'Белый\')"></div>' +
          '<div class="ctrl-color" style="background:#ffd700" onclick="pickC(this,\'Тёплый\')"></div>' +
          '<div class="ctrl-color" style="background:#ff4444" onclick="pickC(this,\'Красный\')"></div>' +
          '<div class="ctrl-color" style="background:#4488ff" onclick="pickC(this,\'Синий\')"></div>' +
          '<div class="ctrl-color" style="background:#44dd44" onclick="pickC(this,\'Зелёный\')"></div>' +
        '</div>' +
      '</div>' +
      '<div class="ctrl-log" id="lLog"></div>' +
    '</div>';

  // --- КОНДИЦИОНЕР ---
  if (id === 'ac') return '' +
    '<h2 class="modal-title">' + d.icon + ' ' + d.name + '</h2>' +
    '<div class="ctrl">' +
      '<div class="ctrl-toggle">' +
        '<span>Выкл</span>' +
        '<label class="sw"><input type="checkbox" onchange="log(\'aLog\',this.checked?\'Включён ✅\':\'Выключен ⛔\')"><span class="sw-rail"></span></label>' +
        '<span>Вкл</span>' +
      '</div>' +
      '<div class="ctrl-row">' +
        '<span class="ctrl-label">Температура</span>' +
        '<div class="ctrl-temp">' +
          '<button class="ctrl-temp-btn" onclick="chTemp(-1)">−</button>' +
          '<span class="ctrl-temp-val" id="tVal">22°C</span>' +
          '<button class="ctrl-temp-btn" onclick="chTemp(1)">+</button>' +
        '</div>' +
      '</div>' +
      '<div class="ctrl-row">' +
        '<span class="ctrl-label">Режим</span>' +
        '<div class="ctrl-btns">' +
          '<button class="ctrl-mode on" onclick="setM(this,\'aLog\',\'Холод ❄️\')">❄️ Холод</button>' +
          '<button class="ctrl-mode" onclick="setM(this,\'aLog\',\'Тепло 🔥\')">🔥 Тепло</button>' +
          '<button class="ctrl-mode" onclick="setM(this,\'aLog\',\'Авто 🔄\')">🔄 Авто</button>' +
        '</div>' +
      '</div>' +
      '<div class="ctrl-log" id="aLog"></div>' +
    '</div>';

  // --- УМНАЯ КОЛОНКА ---
  if (id === 'speaker') return '' +
    '<h2 class="modal-title">' + d.icon + ' ' + d.name + '</h2>' +
    '<div class="ctrl">' +
      '<div class="ctrl-track" id="trN">🎵 Ничего не играет</div>' +
      '<div class="ctrl-player">' +
        '<button class="ctrl-play" onclick="swTr(-1)">⏮</button>' +
        '<button class="ctrl-play main" id="plB" onclick="togPlay()">▶</button>' +
        '<button class="ctrl-play" onclick="swTr(1)">⏭</button>' +
      '</div>' +
      '<div class="ctrl-row">' +
        '<span class="ctrl-label">Громкость: <span id="voV">50</span>%</span>' +
        '<input type="range" class="ctrl-range" min="0" max="100" value="50" oninput="document.getElementById(\'voV\').textContent=this.value">' +
      '</div>' +
      '<div class="ctrl-log" id="sLog"></div>' +
    '</div>';

  // --- УМНАЯ РОЗЕТКА ---
  if (id === 'plug') return '' +
    '<h2 class="modal-title">' + d.icon + ' ' + d.name + '</h2>' +
    '<div class="ctrl">' +
      '<div class="ctrl-toggle">' +
        '<span>Выкл</span>' +
        '<label class="sw"><input type="checkbox" onchange="togPlug(this)"><span class="sw-rail"></span></label>' +
        '<span>Вкл</span>' +
      '</div>' +
      '<div class="ctrl-watts">' +
        '<div class="ctrl-watts-num" id="wVal">0 Вт</div>' +
        '<div class="ctrl-watts-label">Потребление</div>' +
      '</div>' +
      '<div class="ctrl-row">' +
        '<span class="ctrl-label">Таймер</span>' +
        '<div class="ctrl-btns">' +
          '<button class="ctrl-mode" onclick="setM(this,\'pLog\',\'30 мин\')">30 мин</button>' +
          '<button class="ctrl-mode" onclick="setM(this,\'pLog\',\'1 час\')">1 час</button>' +
          '<button class="ctrl-mode" onclick="setM(this,\'pLog\',\'2 часа\')">2 часа</button>' +
        '</div>' +
      '</div>' +
      '<div class="ctrl-log" id="pLog"></div>' +
    '</div>';

  return '';
}


// =====================
//  ФУНКЦИИ УСТРОЙСТВ
// =====================

// Режимы
function setM(btn, logId, name) {
  var all = btn.parentElement.querySelectorAll('.ctrl-mode');
  for (var i = 0; i < all.length; i++) all[i].classList.remove('on');
  btn.classList.add('on');
  log(logId, 'Режим: ' + name);
}

// Пылесос
function togVac() {
  vacOn = !vacOn;
  document.getElementById('vSt').textContent = vacOn ? 'Статус: Уборка...' : 'Статус: Ожидание';
  log('vLog', vacOn ? 'Уборка начата ✅' : 'Остановлено ⏹');
}

function vacHome() {
  vacOn = false;
  document.getElementById('vSt').textContent = 'Статус: Едет на базу...';
  log('vLog', 'На базу 🏠');
}

// Лампочка — цвет
function pickC(btn, name) {
  var all = btn.parentElement.querySelectorAll('.ctrl-color');
  for (var i = 0; i < all.length; i++) all[i].classList.remove('pick');
  btn.classList.add('pick');
  log('lLog', 'Цвет: ' + name);
}

// Кондиционер — температура
function chTemp(d) {
  acTemp += d;
  if (acTemp < 16) acTemp = 16;
  if (acTemp > 30) acTemp = 30;
  document.getElementById('tVal').textContent = acTemp + '°C';
  log('aLog', 'Температура: ' + acTemp + '°C');
}

// Колонка — плеер
function togPlay() {
  spkPlaying = !spkPlaying;
  document.getElementById('plB').textContent = spkPlaying ? '⏸' : '▶';
  document.getElementById('trN').textContent = spkPlaying ? '🎵 ' + spkTracks[spkTrack] : '🎵 Пауза';
  log('sLog', spkPlaying ? 'Играет: ' + spkTracks[spkTrack] : 'Пауза');
}

function swTr(dir) {
  spkTrack = (spkTrack + dir + spkTracks.length) % spkTracks.length;
  if (spkPlaying) {
    document.getElementById('trN').textContent = '🎵 ' + spkTracks[spkTrack];
    log('sLog', 'Трек: ' + spkTracks[spkTrack]);
  }
}

// Розетка
function togPlug(cb) {
  if (plugTimer) { clearInterval(plugTimer); plugTimer = null; }
  if (cb.checked) {
    log('pLog', 'Включена ✅');
    plugTimer = setInterval(function () {
      var w = Math.floor(Math.random() * 200 + 50);
      var el = document.getElementById('wVal');
      if (el) el.textContent = w + ' Вт';
    }, 1500);
  } else {
    log('pLog', 'Выключена ⛔');
    document.getElementById('wVal').textContent = '0 Вт';
  }
}


// =====================
//  СТАРТ
// =====================
drawCards();