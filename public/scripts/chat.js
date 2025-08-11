// Basic chat UI logic: message send, mock reply, sidebar toggle, theme toggle

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const body = document.body;
  const thread = $('#thread');
  const composer = $('#composer');
  const input = $('#promptInput');
  const homeHero = $('#homeHero');
  const sidebar = $('#sidebar');
  const sidebarToggle = $('#sidebarToggle');
  const sidebarClose = $('#sidebarClose');
  const themeToggle = $('#themeToggle');
  const chatList = $('#chatList');
  const newChatBtn = $('#newChatBtn');

  // Sidebar toggling for mobile
  function openSidebar() {
    sidebar?.classList.add('is-open');
  }
  function closeSidebar() {
    sidebar?.classList.remove('is-open');
  }
  sidebarToggle?.addEventListener('click', openSidebar);
  sidebarClose?.addEventListener('click', closeSidebar);
  sidebar?.addEventListener('click', (e) => {
    if (e.target === sidebar) closeSidebar(); // backdrop click
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // New chat: clear thread and reset preview
  newChatBtn?.addEventListener('click', () => {
    // Clear messages
    thread.innerHTML = '';
    // Show hero again
    homeHero?.classList.remove('is-hidden');
    // Reset input
    input.value = '';
    autosize();
    // Reset sidebar active item text
    if (chatList) {
      let active = chatList.querySelector('.chat-list__item.is-active');
      if (!active) {
        active = document.createElement('li');
        active.className = 'chat-list__item is-active';
        chatList.prepend(active);
      }
      active.textContent = 'New chat';
    }
  });

  // Auto-resize textarea
  function autosize() {
    input.style.height = 'auto';
    const max = 200; // px cap
    input.style.height = Math.min(input.scrollHeight, max) + 'px';
  }
  input?.addEventListener('input', autosize);
  autosize();

  // Quick action chips
  $$('.pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      input.value = pill.getAttribute('data-prompt') || '';
      autosize();
      input.focus();
    });
  });

  // Helpers to render bubbles
  function bubble(role, text) {
    const item = document.createElement('article');
    item.className = `msg msg--${role}`;
    const avatar = document.createElement('div');
    avatar.className = 'msg__avatar';
    avatar.textContent = role === 'user' ? '🙂' : '🤖';
    const content = document.createElement('div');
    content.className = 'msg__content';
    const p = document.createElement('p');
    p.textContent = text;
    content.appendChild(p);
    item.appendChild(avatar);
    item.appendChild(content);
    return item;
  }

  function scrollToBottom() {
    thread?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function mockReply(text) {
    // Very simple mock: echo and add a friendly line after a tiny delay
    const thinking = bubble('assistant', 'Thinking…');
    thread.appendChild(thinking);
    scrollToBottom();
    setTimeout(() => {
      thinking.querySelector('.msg__content p').textContent =
        `You said: "${text}"\n\nHere's a short reply to keep the flow going.`;
      scrollToBottom();
    }, 600 + Math.random() * 700);
  }

  function addRecentChatPreview(text) {
    if (!chatList) return;
    const firstItem = chatList.querySelector('.chat-list__item.is-active');
    // Create a preview entry for the current chat title
    const preview = text.trim().slice(0, 40) || 'New message';
    if (firstItem) firstItem.textContent = preview;
  }

  function send(text) {
    if (!text.trim()) return;
    // Hide hero on first send
    homeHero?.classList.add('is-hidden');
    // Add user bubble
    thread.appendChild(bubble('user', text.trim()))
    scrollToBottom();
    // Clear input
    input.value = '';
    autosize();
    // Update sidebar recent chat preview
    addRecentChatPreview(text);
    // Mock assistant
    mockReply(text.trim());
  }

  composer?.addEventListener('submit', (e) => {
    e.preventDefault();
    send(input.value);
  });

  // Enter to send, Shift+Enter new line
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      composer?.dispatchEvent(new Event('submit'));
    }
  });
})();
