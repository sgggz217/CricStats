/* ── compare.js — Player comparison logic ────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  setupAutocomplete('search-1', 'ac-list-1', 1);
  setupAutocomplete('search-2', 'ac-list-2', 2);
});

let selectedPlayers = { 1: null, 2: null };
let allPlayers = [];

// Team logo mapping
const teamLogos = {
  'India': 'https://flagcdn.com/in.svg',
  'Australia': 'https://flagcdn.com/au.svg',
  'England': 'https://flagcdn.com/gb-eng.svg',
  'New Zealand': 'https://flagcdn.com/nz.svg',
  'South Africa': 'https://flagcdn.com/za.svg',
  'Pakistan': 'https://flagcdn.com/pk.svg',
  'Sri Lanka': 'https://flagcdn.com/lk.svg',
  'West Indies': 'https://flagcdn.com/wi.svg',
  'Bangladesh': 'https://flagcdn.com/bd.svg',
  'Afghanistan': 'https://flagcdn.com/af.svg'
};

// Player image mapping (using random generated images or you can use specific URLs)
function getPlayerImage(name) {
  // Using UI Avatars API to generate avatar from player name
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=2c3e50&color=fff&bold=true`;
}

// Load all players for autocomplete
async function loadAllPlayers() {
  try {
    const res = await fetch(`${API}/players/`);
    allPlayers = await res.json();
  } catch (e) {
    console.error('Failed to load players:', e);
  }
}
loadAllPlayers();

/* ── Autocomplete ────────────────────────────────────────────────────────── */
function setupAutocomplete(inputId, listId, slot) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  let debounce = null;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    if (q.length < 2) { list.classList.remove('show'); return; }

    debounce = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/search/${encodeURIComponent(q)}`);
        const players = await res.json();
        list.innerHTML = '';

        if (!players.length) {
          list.innerHTML = '<div class="autocomplete-item" style="color:var(--text-muted)">No players found</div>';
          list.classList.add('show');
          return;
        }

        players.forEach(p => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          item.textContent = `${p.name} (${p.team} - ${p.type})`;
          item.addEventListener('click', () => {
            input.value = p.name;
            selectedPlayers[slot] = p;
            list.classList.remove('show');
          });
          list.appendChild(item);
        });
        list.classList.add('show');
      } catch (e) {
        console.error('Search failed:', e);
      }
    }, 250);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest(`#${inputId}`) && !e.target.closest(`#${listId}`)) {
      list.classList.remove('show');
    }
  });
}

/* ── Compare ─────────────────────────────────────────────────────────────── */
async function comparePlayers() {
  const p1 = selectedPlayers[1];
  const p2 = selectedPlayers[2];
  const container = document.getElementById('compare-result');

  if (!p1 || !p2) {
    container.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--text-muted)">
        Please select two players from the search dropdowns above.
      </div>`;
    return;
  }

  try {
    const [res1, res2] = await Promise.all([
      fetch(`${API}/player/${p1.id}`),
      fetch(`${API}/player/${p2.id}`)
    ]);
    
    const player1Data = await res1.json();
    const player2Data = await res2.json();

    container.innerHTML = buildComparisonHTML(player1Data, player2Data);
  } catch (e) {
    console.error('Failed to compare players:', e);
    container.innerHTML = '<p style="color:red;">Failed to load comparison data.</p>';
  }
}

function buildComparisonHTML(p1, p2) {
  const p1Image = getPlayerImage(p1.name);
  const p2Image = getPlayerImage(p2.name);
  const p1Logo = teamLogos[p1.team] || '';
  const p2Logo = teamLogos[p2.team] || '';

  return `
    <div class="compare-grid">
      <div class="compare-card">
        <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;">
          <div style="position:relative;">
            <img src="${p1Image}" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--primary-color);" />
            ${p1Logo ? `<img src="${p1Logo}" style="position:absolute;bottom:-5px;right:-5px;width:30px;height:20px;border-radius:4px;border:2px solid var(--bg-primary);" />` : ''}
          </div>
          <div>
            <h3 style="margin:0;">${p1.name}</h3>
            <p style="margin:5px 0 0;color:var(--text-muted);"><strong>Team:</strong> ${p1.team}</p>
          </div>
        </div>
        <p><strong>Type:</strong> ${p1.type}</p>
        <p><strong>Debut:</strong> ${p1.debut_year || '—'}</p>
        
        <h4>🏏 Batting Stats</h4>
        ${p1.batting ? `
          <table class="compare-stats-table">
            <tr><td>Matches</td><td>${p1.batting.matches}</td></tr>
            <tr><td>Innings</td><td>${p1.batting.innings}</td></tr>
            <tr><td>Runs</td><td>${p1.batting.runs.toLocaleString()}</td></tr>
            <tr><td>Average</td><td>${p1.batting.average}</td></tr>
            <tr><td>Strike Rate</td><td>${p1.batting.strike_rate}</td></tr>
            <tr><td>Centuries</td><td>${p1.batting.centuries}</td></tr>
            <tr><td>Half Centuries</td><td>${p1.batting.half_centuries}</td></tr>
          </table>
        ` : '<p>No batting data</p>'}
        
        <h4>🎳 Bowling Stats</h4>
        ${p1.bowling ? `
          <table class="compare-stats-table">
            <tr><td>Matches</td><td>${p1.bowling.matches}</td></tr>
            <tr><td>Wickets</td><td>${p1.bowling.wickets}</td></tr>
            <tr><td>Economy</td><td>${p1.bowling.economy}</td></tr>
            <tr><td>Average</td><td>${p1.bowling.average}</td></tr>
            <tr><td>Best Bowling</td><td>${p1.bowling.best_bowling}</td></tr>
            <tr><td>5-Wicket Hauls</td><td>${p1.bowling.five_wickets}</td></tr>
          </table>
        ` : '<p>No bowling data</p>'}
      </div>
      
      <div class="compare-card">
        <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;">
          <div style="position:relative;">
            <img src="${p2Image}" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--primary-color);" />
            ${p2Logo ? `<img src="${p2Logo}" style="position:absolute;bottom:-5px;right:-5px;width:30px;height:20px;border-radius:4px;border:2px solid var(--bg-primary);" />` : ''}
          </div>
          <div>
            <h3 style="margin:0;">${p2.name}</h3>
            <p style="margin:5px 0 0;color:var(--text-muted);"><strong>Team:</strong> ${p2.team}</p>
          </div>
        </div>
        <p><strong>Type:</strong> ${p2.type}</p>
        <p><strong>Debut:</strong> ${p2.debut_year || '—'}</p>
        
        <h4>🏏 Batting Stats</h4>
        ${p2.batting ? `
          <table class="compare-stats-table">
            <tr><td>Matches</td><td>${p2.batting.matches}</td></tr>
            <tr><td>Innings</td><td>${p2.batting.innings}</td></tr>
            <tr><td>Runs</td><td>${p2.batting.runs.toLocaleString()}</td></tr>
            <tr><td>Average</td><td>${p2.batting.average}</td></tr>
            <tr><td>Strike Rate</td><td>${p2.batting.strike_rate}</td></tr>
            <tr><td>Centuries</td><td>${p2.batting.centuries}</td></tr>
            <tr><td>Half Centuries</td><td>${p2.batting.half_centuries}</td></tr>
          </table>
        ` : '<p>No batting data</p>'}
        
        <h4>🎳 Bowling Stats</h4>
        ${p2.bowling ? `
          <table class="compare-stats-table">
            <tr><td>Matches</td><td>${p2.bowling.matches}</td></tr>
            <tr><td>Wickets</td><td>${p2.bowling.wickets}</td></tr>
            <tr><td>Economy</td><td>${p2.bowling.economy}</td></tr>
            <tr><td>Average</td><td>${p2.bowling.average}</td></tr>
            <tr><td>Best Bowling</td><td>${p2.bowling.best_bowling}</td></tr>
            <tr><td>5-Wicket Hauls</td><td>${p2.bowling.five_wickets}</td></tr>
          </table>
        ` : '<p>No bowling data</p>'}
      </div>
    </div>
  `;
}

window.comparePlayers = comparePlayers;