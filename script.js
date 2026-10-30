(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  function setTheme(theme) {
    root.dataset.theme = theme;
    themeButton.textContent = theme === 'dark' ? '☼' : '◐';
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101010' : '#f5f4f0';
  }
  try { if (localStorage.getItem('firstxi-theme') === 'light') setTheme('light'); } catch (_) { /* Storage is optional. */ }
  themeButton.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('firstxi-theme', theme); } catch (_) { /* Continue without persistence. */ }
  });
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  function closeMenu(restoreFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    mobileNav.hidden = true;
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) mobileNav.querySelector('a').focus();
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  const desktopMedia = matchMedia('(min-width: 801px)');
  desktopMedia.addEventListener('change', e => { if (e.matches) closeMenu(); });
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownButton = dropdown.querySelector('button');
  const dropdownPanel = document.querySelector('#services-menu');
  function closeDropdown() { dropdownButton.setAttribute('aria-expanded', 'false'); dropdownPanel.hidden = true; }
  dropdownButton.addEventListener('click', () => {
    dropdownPanel.hidden = !dropdownPanel.hidden;
    dropdownButton.setAttribute('aria-expanded', String(!dropdownPanel.hidden));
  });
  document.addEventListener('click', event => { if (!dropdown.contains(event.target)) closeDropdown(); });
  dropdown.addEventListener('focusout', event => { if (!dropdown.contains(event.relatedTarget)) closeDropdown(); });
  dropdownPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDropdown));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!mobileNav.hidden) closeMenu(true);
      if (!dropdownPanel.hidden) { closeDropdown(); dropdownButton.focus(); }
    }
    if (event.key === 'Tab' && !mobileNav.hidden) {
      const focusable = [...document.querySelectorAll('.header-actions a, .header-actions button, #mobile-nav a')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    root.classList.add('motion-ready');
  }
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      document.querySelectorAll('[data-category]').forEach(card => {
        card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      });
    });
  });
  document.querySelectorAll('[data-inquiry], [data-sport]').forEach(link => {
    link.addEventListener('click', () => {
      if (link.dataset.inquiry) document.querySelector('#interest').value = link.dataset.inquiry;
      if (link.dataset.sport) {
        document.querySelector('#sport-input').value = link.dataset.sport;
        document.querySelector('#interest').value = 'Athlete representation';
      }
    });
  });
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  let inquiryText = '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const message = String(data.get('message')).trim();
    if (!name || !message) { status.textContent = 'Please enter your name and a message.'; return; }
    inquiryText = `Hello First X&XI,\n\n${message}\n\nName: ${name}\nEmail: ${data.get('email')}\nInterest: ${data.get('interest')}\nSport / organization: ${data.get('sport') || 'Not specified'}`;
    const url = `mailto:info@firstxandxi.com?subject=${encodeURIComponent(`Website inquiry — ${data.get('interest')}`)}&body=${encodeURIComponent(inquiryText)}`;
    const fallback = document.querySelector('#email-fallback');
    fallback.href = url;
    fallback.hidden = false;
    document.querySelector('#copy-inquiry').hidden = false;
    status.textContent = `Your email draft is ready. Send it from your email app to complete your inquiry. If no app opens, copy the text and email info@firstxandxi.com.`;
    window.location.href = url;
  });
  document.querySelector('#copy-inquiry').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(inquiryText); status.textContent = `Inquiry copied. Paste it into an email to info@firstxandxi.com.`; }
    catch (_) { status.textContent = `Copy is unavailable in this browser. You can email your message directly to info@firstxandxi.com.`; }
  });
  const dialog = document.querySelector('#privacy-dialog');
  document.querySelector('#privacy-button').addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
