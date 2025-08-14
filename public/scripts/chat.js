// Basic chat UI logic with multi-chat sessions, sidebar toggle, and API placeholders

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const body = document.body;
  const thread = $("#thread");
  const composer = $("#composer");
  const input = $("#promptInput");
  const homeHero = $("#homeHero");
  const sidebar = $("#sidebar");
  const sidebarToggle = $("#sidebarToggle");
  const sidebarClose = $("#sidebarClose");
  const themeToggle = $("#themeToggle");
  const chatList = $("#chatList");
  const newChatBtn = $("#newChatBtn");
  const clearChatBtn = $("#ClearChatBtn");

  // Initialize socket.io client if available
  const socket = typeof io === "function" ? io() : null;

  // --- Simple in-memory session store (replace with API later) ---
  /**
   * Chat shape: { id: string, title: string, titleLocked: boolean, messages: Array<{role:'user'|'assistant', content:string}> }
   */
  let chats = [];
  let activeChatId = null;

  // API placeholders (to be implemented with backend later)
  async function apiCreateChatSession(chat) {
    console.debug("[placeholder] create chat session", chat);
    // Example: const { id } = await fetch('/api/chats', {method:'POST', body: JSON.stringify({...})}).then(r=>r.json());
    return { id: chat.id }; // echo local id for now
  }
  async function apiFetchMessages(chatId) {
    console.debug("[placeholder] fetch messages for", chatId);
    // Example: return fetch(`/api/chats/${chatId}/messages`).then(r=>r.json());
    return [];
  }
  async function apiSaveMessage(chatId, role, content) {
    console.debug("[placeholder] save message", { chatId, role, content });
    // Example: await fetch(`/api/chats/${chatId}/messages`, {method:'POST', body: JSON.stringify({role, content})})
  }
  async function apiClearChat(chatId) {
    console.debug("[placeholder] clear chat on server", { chatId });
    // Example: await fetch(`/api/chats/${chatId}/messages`, { method: 'DELETE' })
  }

  function createLocalChat() {
    const chat = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: "New chat",
      titleLocked: false,
      messages: [],
    };
    return chat;
  }
  function getActiveChat() {
    return chats.find((c) => c.id === activeChatId) || null;
  }
  function setActiveChat(id) {
    activeChatId = id;
    renderChatList();
    renderThread();
  }
  function renderChatList() {
    if (!chatList) return;
    chatList.innerHTML = "";
    chats.forEach((chat) => {
      const li = document.createElement("li");
      li.className = "chat-list__item" + (chat.id === activeChatId ? " is-active" : "");
      li.textContent = chat.title || "New chat";
      li.dataset.id = chat.id;
      chatList.appendChild(li);
    });
  }
  function renderThread() {
    if (!thread) return;
    thread.innerHTML = "";
    const chat = getActiveChat();
    if (!chat) return;
    if (chat.messages.length === 0) {
      homeHero?.classList.remove("is-hidden");
      return;
    }
    homeHero?.classList.add("is-hidden");
    chat.messages.forEach((m) => thread.appendChild(bubble(m.role, m.content)));
    scrollToBottom();
  }

  // Sidebar toggling for mobile
  function openSidebar() {
    sidebar?.classList.add("is-open");
  }
  function closeSidebar() {
    sidebar?.classList.remove("is-open");
  }
  sidebarToggle?.addEventListener("click", openSidebar);
  sidebarClose?.addEventListener("click", closeSidebar);
  sidebar?.addEventListener("click", (e) => {
    if (e.target === sidebar) closeSidebar(); // backdrop click
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // New chat: create a brand-new session instead of overwriting the current
  newChatBtn?.addEventListener("click", async () => {
    const chat = createLocalChat();
    chats.unshift(chat);
    setActiveChat(chat.id);
    if (input) {
      input.value = "";
      autosize();
    }
    // Placeholder: create chat on server
    await apiCreateChatSession(chat);
  });

  // Clear only the active chat's messages
  clearChatBtn?.addEventListener("click", async () => {
    const chat = getActiveChat();
    if (!chat) return;
    chat.messages = [];
    chat.title = "New chat";
    chat.titleLocked = false;
    renderThread();
    renderChatList();
    await apiClearChat(chat.id);
  });

  // Auto-resize textarea
  function autosize() {
    if (!input) return;
    input.style.height = "auto";
    const max = 200; // px cap
    input.style.height = Math.min(input.scrollHeight, max) + "px";
  }
  input?.addEventListener("input", autosize);
  if (input) autosize();

  // Quick action chips
  $$(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      if (!input) return;
      input.value = pill.getAttribute("data-prompt") || "";
      autosize();
      input.focus();
    });
  });

  // Helpers to render bubbles
  function bubble(role, text) {
    const item = document.createElement("article");
    item.className = `msg msg--${role}`;
    const avatar = document.createElement("div");
    avatar.className = "msg__avatar";
    avatar.textContent = role === "user" ? "🙂" : "🤖";
    const content = document.createElement("div");
    content.className = "msg__content";
    const p = document.createElement("p");
    p.textContent = text;
    content.appendChild(p);
    item.appendChild(avatar);
    item.appendChild(content);
    return item;
  }

  // Ensure the thread scrolls to the newest message
  function scrollToBottom() {
    if (!thread) return;
    thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
  }
  // AI reply via socket (bound to the chatId to avoid cross-session mixups)
  function aiReply(chatId, text) {
    const isActive = activeChatId === chatId;
    const thinking = bubble("assistant", "Thinking…");
    if (isActive) {
      thread?.appendChild(thinking);
      scrollToBottom();
    }
    if (socket) {
      socket.emit("Ai-message", text);
      socket.once("Ai-response", async (response) => {
        const target = chats.find((c) => c.id === chatId);
        if (target) {
          target.messages.push({ role: "assistant", content: response });
          await apiSaveMessage(chatId, "assistant", response);
        }
        if (isActive) {
          const p = thinking.querySelector(".msg__content p");
          if (p) {
            p.textContent = response;
          } else {
            thinking.replaceWith(bubble("assistant", response));
          }
          scrollToBottom();
        }
      });
    } else {
      setTimeout(async () => {
        const fallback = "Unable to connect to server.";
        const target = chats.find((c) => c.id === chatId);
        if (target) {
          target.messages.push({ role: "assistant", content: fallback });
          await apiSaveMessage(chatId, "assistant", fallback);
        }
        if (isActive) {
          const p = thinking.querySelector(".msg__content p");
          if (p) p.textContent = fallback;
          scrollToBottom();
        }
      }, 500);
    }
  }

  function lockTitleFromFirstMessage(text) {
    const chat = getActiveChat();
    if (!chat || chat.titleLocked) return;
    const firstLine = text.trim().split("\n")[0];
    const preview = firstLine.slice(0, 60) || "New chat";
    chat.title = preview;
    chat.titleLocked = true;
    renderChatList();
  }

  async function send(text) {
    if (!text.trim()) return;
    const chat = getActiveChat();
    if (!chat) return;
    // Hide hero on first send for this chat
    homeHero?.classList.add("is-hidden");
    // Persist locally and render
    const clean = text.trim();
    chat.messages.push({ role: "user", content: clean });
    if (thread) thread.appendChild(bubble("user", clean));
    scrollToBottom();
    // Clear input
    if (input) {
      input.value = "";
      autosize();
    }
    // Update sidebar title from first message
    lockTitleFromFirstMessage(clean);
    // Placeholder: save message to backend
    await apiSaveMessage(chat.id, "user", clean);
    // Ask assistant
    aiReply(chat.id, clean);
  }

  composer?.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input?.value || "");
  });

  // Enter to send, Shift+Enter new line
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      composer?.dispatchEvent(new Event("submit"));
    }
  });

  // Switch between chats via sidebar
  chatList?.addEventListener("click", async (e) => {
    const li = e.target.closest(".chat-list__item");
    if (!li || !li.dataset.id) return;
    const id = li.dataset.id;
    if (id === activeChatId) return;
    setActiveChat(id);
    const chat = getActiveChat();
    if (chat && chat.messages.length === 0) {
      // Placeholder: fetch historical messages for this chat
      const msgs = await apiFetchMessages(id);
      if (Array.isArray(msgs) && msgs.length) {
        chat.messages = msgs;
        renderThread();
      }
    }
  });

  // Initial boot: create one chat if none
  (function boot() {
    if (chats.length === 0) {
      const initial = createLocalChat();
      chats.push(initial);
      activeChatId = initial.id;
    }
    renderChatList();
    renderThread();
  })();
})();
