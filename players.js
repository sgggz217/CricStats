/* ── players.js — Players page logic ─────────────────────────────────────── */



document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadAllPlayers();
  loadFilters();
});

/* ── Tabs ─────────────────────────────────────────────────────────────────── */
function initTabs() {
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

/* ── Load Data ───────────────────────────────────────────────────────────── */
let allPlayers = [];

async function loadAllPlayers() {
  try {
    const res = await fetch(`${API}/players/`);
    allPlayers = await res.json();
    
    // Load all player stats at once
    const statsPromises = allPlayers.map(p => 
      fetch(`${API}/player/${p.id}`).then(res => res.json()).catch(() => null)
    );
    const allStats = await Promise.all(statsPromises);
    
    // Attach stats to players
    allPlayers.forEach((p, index) => {
      p.stats = allStats[index] || {};
    });
    
    renderBatting(allPlayers);
    renderBowling(allPlayers);
    renderAllrounder(allPlayers);
  } catch (e) {
    console.error('Failed to load players:', e);
  }
}

async function loadFilters() {
  try {
    const res = await fetch(`${API}/api/filters`);
    const data = await res.json();
    
    const teamSelect = document.getElementById('filter-team');
    const roleSelect = document.getElementById('filter-role');
    
    teamSelect.innerHTML = '<option>All</option>';
    roleSelect.innerHTML = '<option>All</option>';
    
    data.teams.forEach(team => {
      const opt = document.createElement('option');
      opt.value = team;
      opt.textContent = team;
      teamSelect.appendChild(opt);
    });
    
    data.types.forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      roleSelect.appendChild(opt);
    });
  } catch (e) {
    console.error('Failed to load filters:', e);
  }
}

function renderBatting(players) {
  const tbody = document.getElementById('batting-tbody');
  tbody.innerHTML = '';

  const filtered = players.filter(p => p.stats && p.stats.batting);
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:2rem">No batting data available</td></tr>';
    return;
  }

  filtered.forEach(p => {
    const s = p.stats.batting;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.name}</strong></td>
      <td>${p.team}</td>
      <td>${s.matches}</td>
      <td>${s.innings}</td>
      <td>${s.runs.toLocaleString()}</td>
      <td>${s.average}</td>
      <td>${s.strike_rate}</td>
      <td>${s.centuries}</td>
      <td>${s.half_centuries}</td>`;
    tbody.appendChild(tr);
  });
}

function renderBowling(players) {
  const tbody = document.getElementById('bowling-tbody');
  tbody.innerHTML = '';

  const filtered = players.filter(p => p.stats && p.stats.bowling);
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem">No bowling data available</td></tr>';
    return;
  }

  filtered.forEach(p => {
    const s = p.stats.bowling;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.name}</strong></td>
      <td>${p.team}</td>
      <td>${s.matches}</td>
      <td>${s.innings}</td>
      <td>${s.wickets}</td>
      <td>${s.average}</td>
      <td>${s.economy}</td>
      <td>${s.best_bowling}</td>`;
    tbody.appendChild(tr);
  });
}

function renderAllrounder(players) {
  const tbody = document.getElementById('allrounder-tbody');
  tbody.innerHTML = '';

  const filtered = players.filter(p => p.stats && p.stats.allrounder);
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem">No allrounder data available</td></tr>';
    return;
  }

  filtered.forEach(p => {
    const s = p.stats.allrounder;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.name}</strong></td>
      <td>${p.team}</td>
      <td>${s.matches}</td>
      <td>${s.runs.toLocaleString()}</td>
      <td>${s.wickets}</td>
      <td>${s.batting_strike_rate}</td>
      <td>${s.economy}</td>`;
    tbody.appendChild(tr);
  });
}

/* ── Filter ──────────────────────────────────────────────────────────────── */
function applyFilter() {
  const nameQ = document.getElementById('filter-name').value.toLowerCase();
  const teamQ = document.getElementById('filter-team').value;
  const roleQ = document.getElementById('filter-role').value;

  let filtered = allPlayers.filter(p => {
    const nameMatch = !nameQ || p.name.toLowerCase().includes(nameQ);
    const teamMatch = teamQ === 'All' || p.team === teamQ;
    const roleMatch = roleQ === 'All' || p.type === roleQ;
    return nameMatch && teamMatch && roleMatch;
  });

  renderBatting(filtered);
  renderBowling(filtered);
  renderAllrounder(filtered);

  document.querySelector('[data-tab="tab-batting"]').click();
}

window.applyFilter = applyFilter;