/* ── teams.js — Teams page logic ─────────────────────────────────────────── */



document.addEventListener('DOMContentLoaded', loadTeams);

async function loadTeams() {
  const container = document.getElementById('teams-container');

  try {
    const res = await fetch(`${API}/teams/with-players`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const teams = await res.json();

    if (!teams.length) {
      container.innerHTML = '<p class="teams-empty">No teams found.</p>';
      return;
    }

    container.innerHTML = teams.map((team, i) => `
      <div class="team-card" style="animation-delay: ${i * 0.07}s">
        <div class="team-header">
          <h2 class="team-name">${team.name}</h2>
          <span class="team-count">${team.count} players</span>
        </div>
        <div class="team-stats">
          <span>🏏 Runs: ${team.total_runs.toLocaleString()}</span>
          <span>🎳 Wickets: ${team.total_wickets}</span>
        </div>
        <div class="team-roster">
          ${team.players.length
            ? team.players.map(p => `
              <div class="roster-player">
                <span class="player-name">${p.name}</span>
                <span class="player-role">${p.type || '—'}</span>
                <span class="player-debut">${p.debut_year || '—'}</span>
              </div>`).join('')
            : '<p class="no-players">No players listed</p>'
          }
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Failed to load teams:', err);
    container.innerHTML = '<p class="teams-empty">Could not load teams. Is the server running?</p>';
  }
}