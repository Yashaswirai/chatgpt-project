// Small client-side UX: show password toggle, basic required checks, submit button loading
(function () {
  // Apply persisted theme for auth pages as well
  try { window.Theme?.applySavedTheme(); } catch (_) {}
  const themeBtn = document.getElementById('themeToggle');
  themeBtn?.addEventListener('click', () => window.Theme?.toggleTheme());

  const forms = document.querySelectorAll('[data-auth-form]');

  forms.forEach((form) => {
    const submitBtn = form.querySelector('[data-submit]');
    const password = form.querySelector('input[type="password"]');
    const toggle = form.querySelector('[data-toggle]');

    if (toggle && password) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isPwd = password.type === 'password';
        password.type = isPwd ? 'text' : 'password';
        toggle.setAttribute('aria-pressed', String(isPwd));
        toggle.querySelector('[data-eye]')?.classList.toggle('visually-hidden');
        toggle.querySelector('[data-eye-off]')?.classList.toggle('visually-hidden');
      });
    }

    form.addEventListener('submit', () => {
      if (!submitBtn) return;
      submitBtn.disabled = true;
      const original = submitBtn.innerHTML;
      submitBtn.setAttribute('data-original', original);
      submitBtn.innerHTML = '<span class="spinner" aria-hidden="true">⏳</span> Processing...';
    });
  });
})();
