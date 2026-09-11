/* ── app.js — Shared utilities ───────────────────────────────────────────── */

const API = 'http://127.0.0.1:8000';  // Keep this - points to your FastAPI backend

/* ── Theme Toggle ────────────────────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ── Active Nav ──────────────────────────────────────────────────────────── */
function initNav() {
  const page = location.pathname.split('/').pop() || 'cricket.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page) a.classList.add('active');
  });
}

/* ── Init ─────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();

  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', toggleTheme);
});
