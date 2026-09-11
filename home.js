/* ── home.js — Home page logic ───────────────────────────────────────────── */


document.addEventListener('DOMContentLoaded', () => {
  loadSummary();
  loadTopPerformers();
});

async function loadSummary() {
  const cards = {
    players:  document.getElementById('stat-players'),
    runs:     document.getElementById('stat-runs'),
    wickets:  document.getElementById('stat-wickets'),
    sr:       document.getElementById('stat-sr'),
  };

  try {
    const res = await fetch(`${API}/stats/summary`);
    const data = await res.json();

    cards.players.textContent = data.total_players;
    cards.runs.textContent    = data.total_runs.toLocaleString();
    cards.wickets.textContent = data.total_wickets.toLocaleString();
    cards.sr.textContent      = data.avg_strike_rate;
  } catch (e) {
    console.error('Failed to load summary:', e);
    Object.values(cards).forEach(el => el.textContent = '–');
  }
}

async function loadTopPerformers() {
  const batEl  = document.getElementById('top-batsman');
  const bowlEl = document.getElementById('top-bowler');

  try {
    const res = await fetch(`${API}/stats/top-performers`);
    const data = await res.json();

    if (data.top_batsmen && data.top_batsmen.length > 0) {
      const b = data.top_batsmen[0];
      batEl.innerHTML = `
        <div class="performer-avatar bat">🏏</div>
        <div class="performer-info">
          <h3>${b.name}</h3>
          <div class="country">${b.team}</div>
          <div class="stat-line"><strong>${b.runs.toLocaleString()}</strong> runs · Avg ${b.average} · <strong>${b.centuries}</strong> centuries</div>
        </div>`;
    }

    if (data.top_bowlers && data.top_bowlers.length > 0) {
      const w = data.top_bowlers[0];
      bowlEl.innerHTML = `
        <div class="performer-avatar bowl">🎳</div>
        <div class="performer-info">
          <h3>${w.name}</h3>
          <div class="country">${w.team}</div>
          <div class="stat-line"><strong>${w.wickets}</strong> wickets · Econ ${w.economy} · <strong>${w.five_wickets}</strong> 5-wicket hauls</div>
        </div>`;
    }
  } catch (e) {
    console.error('Failed to load top performers:', e);
    batEl.innerHTML  = '<p style="color:var(--text-muted)">Could not load data</p>';
    bowlEl.innerHTML = '<p style="color:var(--text-muted)">Could not load data</p>';
  }
}