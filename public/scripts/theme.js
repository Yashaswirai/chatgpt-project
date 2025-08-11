// Global theme persistence and toggle
(function () {
  const THEME_KEY = 'chat_theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
  }

  function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
  }

  function applySavedTheme() {
    const saved = getSavedTheme();
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.body.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Apply on load
  applySavedTheme();

  // Wire any page-level toggle button with id=themeToggle
  const btn = document.getElementById('themeToggle');
  btn?.addEventListener('click', toggleTheme);

  // Expose minimal API (optional)
  window.Theme = { setTheme, toggleTheme, applySavedTheme };
})();
