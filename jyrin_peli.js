// Lista tavaroista mitä pelaaja lajittelee, jokaiselle jätteelle oma roskis = bin.
const BINS = [
  { id: 'bio', label: 'Biojäte', icon: '🌳' },
  { id: 'paper', label: 'Paperi', icon: '📃' },
  { id: 'plastic', label: 'Muovi', icon: '💿' },
  { id: 'glass', label: 'Lasi', icon: '🍸' },
  { id: 'metal', label: 'Metalli', icon: '🔩' },
  { id: 'mixed', label: 'Sekajäte', icon: '♻️' },
];

const WASTE_ITEMS = [
  { name: 'Banaaninkuori', emoji: '🍌', bin: 'bio' },
  { name: 'Sanomalehti', emoji: '📰', bin: 'paper' },
  { name: 'Muovipullo', emoji: '🍼', bin: 'plastic' },
  { name: 'Lasipullo', emoji: '🍾', bin: 'glass' },
  { name: 'Säilyketölkki', emoji: '🥫', bin: 'metal' },
  { name: 'Vaippa', emoji: '👶', bin: 'mixed' },
];
// Seurataan monesko jäte menossa, oikeat vastaukset ja väärät vastaukset.
let state = {
  current: 0,
  score: 0,
  wrong: 0
};
// Nollaa pisteet, aloittaa pelin alusta ja kutsuu render fuctiota.
function startGame() {
  state.current = 0;
  state.score = 0;
  state.wrong = 0;
  render();
}
// Hakee painetun jätteen, lisää pisteet, kun kaikki käyty kutsuu endgame.
function choose(binId) {
  const item = WASTE_ITEMS[state.current];

  if (item.bin === binId) {
    state.score++;
  } else {
    state.wrong++;
  }

  state.current++;

  if (state.current >= WASTE_ITEMS.length) {
    endGame();
  } else {
    render();
  }
}
// Tallentaa tuloksen localstorageen ja näyttää lopputuloksen pelistä.
function endGame() {
  localStorage.setItem("kierratys_score", state.score);
  localStorage.setItem("kierratys_wrong", state.wrong);

  document.getElementById('app').innerHTML = `
    <div class="end-screen">
      <h2>Pisteet:</h2>
      <div class="end-score">${state.score}</div>
      <div>Väärin: ${state.wrong}</div>
      <button class="btn-restart" onclick="startGame()">Uudelleen</button>
    </div>
  `;
}
// Näyttää käyttöliittymän innerhtml.
function render() {
  const item = WASTE_ITEMS[state.current];

  document.getElementById('app').innerHTML = `
    <div class="header">
      <h1> Kierrätyspeli</h1>
    </div>

    <div class="hud">
      <div class="hud-block">
        <div class="hud-label">Pisteet</div>
        <div class="hud-value">${state.score}</div>
      </div>
      <div class="hud-block">
        <div class="hud-label">Kierros</div>
        <div class="hud-value">${state.current + 1} / ${WASTE_ITEMS.length}</div>
      </div>
      <div class="hud-block">
        <div class="hud-label">Väärin</div>
        <div class="hud-value">${state.wrong}</div>
      </div>
    </div>

    <div class="waste-stage">
      <div class="waste-card">
        <div class="waste-emoji">${item.emoji}</div>
        <div class="waste-name">${item.name}</div>
      </div>
    </div>

    <div class="bins-grid">
      ${BINS.map(b => `
        <button class="bin-btn" onclick="choose('${b.id}')">
          <span class="bin-icon">${b.icon}</span>
          <span class="bin-label">${b.label}</span>
        </button>
      `).join('')}
    </div>
  `;
}

startGame();