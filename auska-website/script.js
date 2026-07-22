// ---------- Demo commodity data ----------
const COMMODITIES = [
  { sym: "WTI", base: 81.4 },
  { sym: "BRENT", base: 85.3 },
  { sym: "NATGAS", base: 2.73 },
  { sym: "COPPER", base: 4.61 },
  { sym: "GOLD", base: 2384 },
  { sym: "URANIUM", base: 92.1 },
  { sym: "COAL", base: 138.2 },
  { sym: "SILVER", base: 29.8 },
];

function randomDelta() {
  return (Math.random() - 0.5) * 2; // -1 to 1 percent-ish
}

function renderTicker() {
  const track = document.getElementById("tickerTrack");
  if (!track) return;
  const build = () => COMMODITIES.map(c => {
    const delta = randomDelta();
    const dir = delta >= 0 ? "up" : "down";
    const arrow = delta >= 0 ? "▲" : "▼";
    return `<span class="tick">${c.sym} <span class="${dir}">${c.base.toFixed(2)} ${arrow}</span></span>`;
  }).join("");
  // duplicate content for seamless scroll loop
  track.innerHTML = build() + build();
}

function renderBoard() {
  const board = document.getElementById("reservesBoard");
  if (!board) return;
  board.innerHTML = COMMODITIES.map(c => {
    const delta = randomDelta();
    const dir = delta >= 0 ? "up" : "down";
    const arrow = delta >= 0 ? "▲" : "▼";
    const price = (c.base * (1 + delta / 100)).toFixed(2);
    return `
      <div class="board-tile">
        <span class="sym">${c.sym}</span>
        <span class="price ${dir}">${price} ${arrow}</span>
      </div>`;
  }).join("");
}

renderTicker();
renderBoard();
setInterval(renderBoard, 2000);

// ---------- Interactive extraction demo ----------
const drillBtn = document.getElementById("drillBtn");
const depthVal = document.getElementById("depthVal");
const resourceVal = document.getElementById("resourceVal");
const auskaVal = document.getElementById("auskaVal");
const rigHint = document.getElementById("rigHint");
const drillIndicator = document.getElementById("drillIndicator");
const strataViz = document.getElementById("strataViz");
const layers = document.querySelectorAll(".strata-layer");

const MAX_DEPTH = 3000;
const RESERVE_DEPTH = 2600;
let depth = 0;
let resource = 0;
let auska = 0;
let holding = false;
let reserveHit = false;
let rafId = null;

function updateStrataVisual() {
  const container = strataViz.getBoundingClientRect();
  const ratio = Math.min(depth / MAX_DEPTH, 1);
  const top = 40 + ratio * (strataViz.scrollHeight - 80);
  drillIndicator.style.top = `${top}px`;

  layers.forEach(layer => {
    const layerDepth = parseInt(layer.dataset.depth, 10);
    if (depth >= layerDepth) layer.classList.add("passed");
    else layer.classList.remove("passed");
  });
}

function tick() {
  if (!holding) return;
  depth = Math.min(depth + 6, MAX_DEPTH);
  resource += reserveHit ? 4 : 1;

  if (!reserveHit && depth >= RESERVE_DEPTH) {
    reserveHit = true;
    resource += 40;
    rigHint.textContent = "⛏ RESERVE STRUCK — demo yield accelerated";
  }

  auska = Math.floor(resource * 0.8);

  depthVal.textContent = `${Math.round(depth)} m`;
  resourceVal.textContent = resource;
  auskaVal.textContent = auska;

  updateStrataVisual();

  if (depth >= MAX_DEPTH) {
    holding = false;
    drillBtn.classList.remove("active");
    rigHint.textContent = "TD reached · reset to run again";
    return;
  }
  rafId = requestAnimationFrame(tick);
}

function startDrill(e) {
  e.preventDefault();
  if (depth >= MAX_DEPTH) {
    // reset
    depth = 0; resource = 0; auska = 0; reserveHit = false;
    rigHint.textContent = "reserve detected at ~2,600 m · keep pushing";
    depthVal.textContent = "0 m";
    resourceVal.textContent = "0";
    auskaVal.textContent = "0";
    updateStrataVisual();
  }
  holding = true;
  drillBtn.classList.add("active");
  if (!rafId) tick();
}

function stopDrill() {
  holding = false;
  drillBtn.classList.remove("active");
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

drillBtn.addEventListener("mousedown", startDrill);
drillBtn.addEventListener("touchstart", startDrill, { passive: false });
window.addEventListener("mouseup", stopDrill);
window.addEventListener("touchend", stopDrill);
drillBtn.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "Enter") startDrill(e);
});
drillBtn.addEventListener("keyup", (e) => {
  if (e.code === "Space" || e.code === "Enter") stopDrill();
});

updateStrataVisual();
