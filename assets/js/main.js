document.getElementById('year').textContent = new Date().getFullYear();

const HISTORY_KEY = 'brawlRankerHistory';
const HISTORY_MAX = 15;
const ROUND_SIZE = 10;

const screens = {
  start: document.getElementById('screen-start'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
};

const el = {
  btnStart: document.getElementById('btnStart'),
  btnAgain: document.getElementById('btnAgain'),
  btnClearHistory: document.getElementById('btnClearHistory'),
  historySection: document.getElementById('historySection'),
  historyList: document.getElementById('historyList'),
  progressLabel: document.getElementById('progressLabel'),
  progressFill: document.getElementById('progressFill'),
  brawlerFrame: document.getElementById('brawlerFrame'),
  brawlerImg: document.getElementById('brawlerImg'),
  brawlerName: document.getElementById('brawlerName'),
  brawlerRarity: document.getElementById('brawlerRarity'),
  slotList: document.getElementById('slotList'),
  resultList: document.getElementById('resultList'),
};

let allBrawlers = [];
let round = null; // { queue: [brawler...], current: 0, slots: [null x 10] }

function showScreen(name) {
  for (const key in screens) screens[key].hidden = key !== name;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

function renderHistory() {
  const history = loadHistory();
  el.historySection.hidden = history.length === 0;
  el.historyList.innerHTML = '';
  history.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'history-item';
    const date = new Date(entry.date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `<span>${date}</span><span>Platz 1: <strong class="history-top1">${entry.ranking[0]}</strong> · Platz 10: <strong>${entry.ranking[9]}</strong></span>`;
    el.historyList.appendChild(div);
  });
}

function startRound() {
  const picks = shuffle(allBrawlers).slice(0, ROUND_SIZE);
  round = { queue: picks, current: 0, slots: new Array(ROUND_SIZE).fill(null) };
  showScreen('game');
  renderSlots();
  renderCurrentBrawler();
}

function renderCurrentBrawler() {
  const brawler = round.queue[round.current];
  el.progressLabel.textContent = `Brawler ${round.current + 1} / ${ROUND_SIZE}`;
  el.progressFill.style.width = `${(round.current / ROUND_SIZE) * 100}%`;
  el.brawlerImg.src = brawler.image;
  el.brawlerImg.alt = brawler.name;
  el.brawlerName.textContent = brawler.name;
  el.brawlerRarity.textContent = brawler.rarity;
  el.brawlerRarity.style.setProperty('--rarity-color', brawler.rarityColor);
  el.brawlerFrame.style.setProperty('--rarity-color', brawler.rarityColor);

  const card = document.getElementById('brawlerCard');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';
}

function renderSlots() {
  el.slotList.innerHTML = '';
  round.slots.forEach((brawler, index) => {
    const li = document.createElement('li');
    li.className = 'slot' + (brawler ? ' slot-filled' : '');
    if (brawler) {
      li.innerHTML = `<span class="slot-rank">${index + 1}</span><img src="${brawler.image}" alt=""><span class="slot-name">${brawler.name}</span>`;
    } else {
      li.innerHTML = `<span class="slot-rank">${index + 1}</span><span class="slot-name">— frei —</span>`;
      li.addEventListener('click', () => placeBrawler(index));
    }
    el.slotList.appendChild(li);
  });
}

function placeBrawler(slotIndex) {
  if (round.slots[slotIndex]) return;
  round.slots[slotIndex] = round.queue[round.current];
  round.current++;
  renderSlots();

  if (round.current >= ROUND_SIZE) {
    finishRound();
  } else {
    renderCurrentBrawler();
  }
}

function finishRound() {
  const ranking = round.slots.map(b => b.name);
  const history = loadHistory();
  history.unshift({ date: Date.now(), ranking });
  saveHistory(history.slice(0, HISTORY_MAX));

  el.resultList.innerHTML = '';
  round.slots.forEach((brawler, index) => {
    const li = document.createElement('li');
    li.className = 'result-item';
    li.innerHTML = `<span class="result-rank">${index + 1}</span><img src="${brawler.image}" alt=""><span class="result-name">${brawler.name}</span>`;
    el.resultList.appendChild(li);
  });

  showScreen('result');
}

function handleKeydown(e) {
  if (screens.game.hidden) return;
  const key = e.key;
  let slotIndex = null;
  if (key >= '1' && key <= '9') slotIndex = Number(key) - 1;
  if (key === '0') slotIndex = 9;
  if (slotIndex !== null) placeBrawler(slotIndex);
}

el.btnStart.addEventListener('click', startRound);
el.btnAgain.addEventListener('click', startRound);
el.btnClearHistory.addEventListener('click', () => {
  saveHistory([]);
  renderHistory();
});
document.addEventListener('keydown', handleKeydown);

fetch('assets/data/brawlers.json')
  .then(res => res.json())
  .then(data => {
    allBrawlers = data;
    renderHistory();
  })
  .catch(() => {
    el.btnStart.disabled = true;
    el.btnStart.textContent = 'Fehler beim Laden der Brawler-Daten';
  });
