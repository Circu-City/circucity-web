(function() {
  var CHATBOT_BASE = "https://chatbot.circucity.com";
  var API_KEY = "{{API_KEY}}";
  var WS_ID = "{{WS_ID}}";
  var WS_NAME = {{WS_NAME}};
  var BOT_NAME = {{BOT_NAME}};
  var GREETING = {{GREETING}};
  var PRIMARY_COLOR = "{{PRIMARY_COLOR}}";
  var VOICE_ENABLED = "{{VOICE_ENABLED}}" === "true";
  var PROACTIVE_ENABLED = "{{PROACTIVE_ENABLED}}" === "true";
  var SESSION_KEY = "cc_session_id";
  var savedSessionId = (function() { try { return localStorage.getItem(SESSION_KEY); } catch(e) { return null; } })();

  var userName = null;

  function detectUserName() {
    var stored = null;
    try { stored = localStorage.getItem("cc_user_name"); } catch(e) {}
    if (stored) return stored;
    var sel = ["[data-customer-name]","[data-user-name]","[data-account-name]",".customer-name",".user-name",".account-name",".header-account__name",".logged-in-name",".welcome-name",".greeting-name","[data-clerk-user-name]","[data-user]"];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el && el.textContent.trim()) return el.textContent.trim().replace(/^(Welcome|Hello|Hi)[,\s]*/i, "");
    }
    try { if (window.Clerk && window.Clerk.user) return window.Clerk.user.firstName || window.Clerk.user.fullName || window.Clerk.user.username; } catch(e) {}
    try { if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props && window.__NEXT_DATA__.props.pageProps) { var u = window.__NEXT_DATA__.props.pageProps.user || window.__NEXT_DATA__.props.pageProps.currentUser || window.__NEXT_DATA__.props.pageProps.customer; if (u) return u.name || u.firstName || u.first_name || u.displayName; } } catch(e) {}
    try { if (window.__USER__) return window.__USER__.name || window.__USER__.firstName; } catch(e) {}
    try { if (window.currentUser) return window.currentUser.name || window.currentUser.firstName; } catch(e) {}
    try { if (window.userData) return window.userData.name || window.userData.firstName; } catch(e) {}
    try { if (window.auth0 && window.auth0.user) return window.auth0.user.name || window.auth0.user.given_name; } catch(e) {}
    try { if (window._loginData) return window._loginData.name; } catch(e) {}
    try {
      var bodyText = document.body.innerText.substring(0,3000);
      var m = bodyText.match(/(?:Welcome|Hello|Hi|Hey)[,\s]+(\w{2,})/i);
      if (m && m[1] && m[1].length > 1 && "the|my|your|this|that|there|here|all".indexOf(m[1].toLowerCase()) === -1) return m[1];
    } catch(e) {}
    return null;
  }

  var PROACTIVE_MESSAGES = [
    "Need assistance finding something?",
    "I'm here if you have any questions.",
    "Looking for recommendations?",
    "Need help comparing products?",
    "Can I help you find what you're looking for?",
    "Let me know if you'd like help with anything."
  ];

  var SUGGESTION_CHIPS = [
    "What products do you recommend?",
    "Tell me about your store",
    "Do you have any deals?",
    "What are your shipping options?",
    "Best sellers?",
    "Do you have eco-friendly gifts?"
  ];

  function timeAwareGreeting(welcomeBack) {
    var hour = new Date().getHours();
    var greeting = "";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    var userPart = userName ? ", " + userName : "";
    if (welcomeBack) return greeting + userPart + "! Welcome back! How can I help today?";
    return greeting + userPart + "! How can I help you today?";
  }

  function detectPageType() {
    var path = window.location.pathname.toLowerCase();
    var url = window.location.href.toLowerCase();
    if (path.indexOf("/checkout") !== -1 || url.indexOf("/checkout") !== -1) return "checkout";
    if (path.indexOf("/cart") !== -1 || url.indexOf("/cart") !== -1) return "cart";
    if (path.indexOf("/product/") !== -1 || path.indexOf("/products/") !== -1 || path.indexOf("/p/") !== -1 || path.indexOf("/item/") !== -1) return "product";
    if (path.indexOf("/category/") !== -1 || path.indexOf("/categories/") !== -1 || path.indexOf("/collections/") !== -1) return "category";
    if (path.indexOf("/search") !== -1 || url.indexOf("?s=") !== -1 || url.indexOf("?q=") !== -1) return "search";
    return "home";
  }

  function getInactivityDelay(pageType) {
    switch(pageType) {
      case "checkout": return 45;
      case "cart": return 60;
      case "product": return 120;
      case "category": return 120;
      default: return 180;
    }
  }

  var proactiveUsedMessages = [];
  var proactiveCooldown = false;
  var inactivityTimer = null;
  var userInteractedWithChat = false;
  var userActivityTimer = null;
  var proactiveShownThisSession = false;

  var pageUrl = window.location.href;
  var pageType = detectPageType();

  function resetInactivityTimer() {
    if (!PROACTIVE_ENABLED || userInteractedWithChat || proactiveCooldown) return;
    if (inactivityTimer) clearTimeout(inactivityTimer);
    var delay = getInactivityDelay(pageType) * 1000;
    inactivityTimer = setTimeout(function() {
      triggerProactive();
    }, delay);
  }

  function triggerProactive() {
    if (!PROACTIVE_ENABLED || userInteractedWithChat || proactiveCooldown) return;

    var available = PROACTIVE_MESSAGES.filter(function(m) {
      return proactiveUsedMessages.indexOf(m) === -1;
    });
    if (available.length === 0) {
      proactiveUsedMessages = [];
      available = PROACTIVE_MESSAGES.slice();
    }
    var msg = available[Math.floor(Math.random() * available.length)];
    proactiveUsedMessages.push(msg);

    showProactiveBubble(msg);

    proactiveCooldown = true;
    setTimeout(function() {
      proactiveCooldown = false;
      loadHistory();
    resetInactivityTimer();
    }, 120000);
  }

  var proactiveBubbleTimer = null;

  function showProactiveBubble(msg) {
    var existing = document.getElementById("cc-ai-proactive");
    if (existing) existing.parentNode.removeChild(existing);

    var el = document.createElement("div");
    el.id = "cc-ai-proactive";
    el.textContent = msg;
    el.style.cssText = "position:fixed;z-index:999998;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px 18px;font-size:14px;color:#0a1428;box-shadow:0 8px 30px rgba(0,0,0,0.15);max-width:260px;line-height:1.4;cursor:pointer;animation:fadeInUp 0.4s ease-out;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif";

    var pos = "{{POSITION}}" || "bottom-right";
    if (pos === "bottom-left") {
      el.style.bottom = "90px"; el.style.left = "20px";
    } else if (pos === "top-right") {
      el.style.top = "90px"; el.style.right = "20px";
    } else if (pos === "top-left") {
      el.style.top = "90px"; el.style.left = "20px";
    } else {
      el.style.bottom = "90px"; el.style.right = "20px";
    }

    el.addEventListener("click", function() {
      showChat();
      el.parentNode.removeChild(el);
    });

    var styleTag = document.createElement("style");
    styleTag.id = "cc-ai-proactive-style";
    if (!document.getElementById("cc-ai-proactive-style")) {
      styleTag.textContent = "@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}";
      document.head.appendChild(styleTag);
    }

    document.body.appendChild(el);

    if (proactiveBubbleTimer) clearTimeout(proactiveBubbleTimer);
    proactiveBubbleTimer = setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 15000);
  }

  var activityEvents = ["mousedown","mousemove","scroll","keydown","touchstart","click"];

  function onUserActivity() {
    if (userActivityTimer) clearTimeout(userActivityTimer);
    userActivityTimer = setTimeout(function() {
      resetInactivityTimer();
    }, 1000);
    resetInactivityTimer();
  }

  function showChat() {
    isOpen = true;
    windowEl.classList.add("open");
    if (messages.length === 0) {
      var greeting = timeAwareGreeting();
      addMessage("bot", greeting);
      showSuggestions();
    }
  }

  for (var i = 0; i < activityEvents.length; i++) {
    document.addEventListener(activityEvents[i], onUserActivity, { passive: true });
  }

  async function init() {
    if (!API_KEY) {
      console.warn("[CircuCity AI] No API key provided");
      return;
    }

    try {
      var verifyRes = await fetch(CHATBOT_BASE + "/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: API_KEY, workspace_id: WS_ID || undefined }),
      });

      if (verifyRes.ok) {
        var verifyData = await verifyRes.json();
        if (verifyData && verifyData.workspace) {
        WS_NAME = verifyData.workspace.businessName || WS_NAME;
        BOT_NAME = (verifyData.embed && verifyData.embed.botName) || BOT_NAME;
        var storedGreeting = verifyData.workspace.greetingMessage;
        var suggested = verifyData.workspace.suggestedPrompts;
        if (suggested) {
          try {
            var parsed = typeof suggested === "string" ? JSON.parse(suggested) : suggested;
            if (Array.isArray(parsed) && parsed.length > 0) {
              PROACTIVE_MESSAGES = parsed.concat(PROACTIVE_MESSAGES).slice(0, 6);
              if (parsed.length >= 3) {
                var suggestionsOverride = [];
                for (var si = 0; si < parsed.length && si < 4; si++) {
                  suggestionsOverride.push(parsed[si]);
                }
                if (suggestionsOverride.length > 0) SUGGESTION_CHIPS = suggestionsOverride;
              }
            }
          } catch(e) {}
        }
        if (storedGreeting) {
          GREETING = storedGreeting;
        }
        PRIMARY_COLOR = (verifyData.embed && verifyData.embed.primaryColor) || PRIMARY_COLOR;
        }
      }
    } catch (err) {
      console.warn("[CircuCity AI] Verify fetch error:", err.message || err);
    }

    userName = detectUserName();
    if (userName) {
      try { localStorage.setItem("cc_user_name", userName); } catch(e) {}
    }

    var style = document.createElement("style");
    style.textContent = "" + `{{CSS_CONTENT}}`;
    document.head.appendChild(style);

    var isOpen = false;
    var sessionId = savedSessionId || "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    try { localStorage.setItem(SESSION_KEY, sessionId); } catch(e) {}
    var messages = [];
    var loadedHistory = null;
    var historyLoaded = false;
    var conversations = [];
    var conversationsFetched = false;

    var widget = document.createElement("div");
    widget.id = "cc-ai-widget";

    var bubble = document.createElement("div");
    bubble.id = "cc-ai-bubble";
    bubble.title = "Chat with " + WS_NAME;
    bubble.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>' +
      "</svg>";
    widget.appendChild(bubble);

    var windowEl = document.createElement("div");
    windowEl.id = "cc-ai-window";

    var header = document.createElement("div");
    header.id = "cc-ai-header";
    header.innerHTML =
      '<div class="title">' +
      '<div class="bot-avatar"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg></div>' +
      "<div>" + BOT_NAME + '<div class="status"><span class="status-dot"></span> Online</div></div>' +
      "</div>" +
      '<div style="display:flex;gap:6px">' +
      '<button id="cc-ai-history-btn" class="new-chat-btn" title="Chat history">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> History</button>' +
      '<button id="cc-ai-new-chat" class="new-chat-btn">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg> New</button>' +
      '</div>';
    windowEl.appendChild(header);

    var messagesEl = document.createElement("div");
    messagesEl.id = "cc-ai-messages";
    windowEl.appendChild(messagesEl);

    var typing = document.createElement("div");
    typing.id = "cc-ai-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    windowEl.appendChild(typing);

    var suggestions = document.createElement("div");
    suggestions.id = "cc-ai-suggestions";
    suggestions.innerHTML = '<div class="suggestions-container"></div>';
    windowEl.appendChild(suggestions);

    var historyPanel = document.createElement("div");
    historyPanel.id = "cc-ai-history-panel";
    historyPanel.innerHTML = '<div style="padding:16px;font-weight:600;font-size:14px;color:#0a1428;border-bottom:1px solid #e2e8f0">Chat History</div><div id="cc-ai-history-list"></div>';
    windowEl.appendChild(historyPanel);

    var inputArea = document.createElement("div");
    inputArea.id = "cc-ai-input-area";
    var inputWrapper = document.createElement("div");
    inputWrapper.id = "cc-ai-input-wrapper";

    var input = document.createElement("input");
    input.id = "cc-ai-input";
    input.type = "text";
    input.placeholder = "Type your message...";
    inputWrapper.appendChild(input);

    inputArea.appendChild(inputWrapper);

    if (VOICE_ENABLED) {
      var micBtn = document.createElement("button");
      micBtn.id = "cc-ai-mic";
      micBtn.type = "button";
      micBtn.title = "Voice input";
      micBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/></svg>';
      micBtn.style.cssText = "background:none;border:none;cursor:pointer;padding:8px;display:flex;align-items:center;justify-content:center;color:#6b7280;border-radius:50%;transition:all 0.2s";
      micBtn.addEventListener("click", function() {
        startVoiceInput();
      });
      inputArea.appendChild(micBtn);
    }

    var sendBtn = document.createElement("button");
    sendBtn.id = "cc-ai-send";
    sendBtn.innerHTML =
      '<svg width="20" height="20" fill="none" stroke="#0A1428" stroke-width="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    inputArea.appendChild(sendBtn);
    windowEl.appendChild(inputArea);

    var footer = document.createElement("div");
    footer.id = "cc-ai-footer";
    footer.innerHTML =
      '<div class="footer-text">Powered by <a href="https://chatbot.circucity.com" class="footer-link" target="_blank">CircuCity AI</a></div>';
    windowEl.appendChild(footer);

    widget.appendChild(windowEl);
    document.body.appendChild(widget);

    function toggle() {
      isOpen = !isOpen;
      windowEl.classList.toggle("open", isOpen);
      if (isOpen) {
        userInteractedWithChat = true;
        if (inactivityTimer) clearTimeout(inactivityTimer);
        var proactiveEl = document.getElementById("cc-ai-proactive");
        if (proactiveEl) proactiveEl.parentNode.removeChild(proactiveEl);
        if (messages.length === 0) {
          if (loadedHistory && loadedHistory.length > 0) {
            var wbGreeting = timeAwareGreeting(true);
            addMessage("bot", wbGreeting);
            for (var hi = 0; hi < loadedHistory.length; hi++) {
              var hm = loadedHistory[hi];
              if (hm.role === "bot" && hm.content.indexOf("How can I help you today") !== -1) continue;
              addMessage(hm.role, hm.content);
            }
            loadedHistory = null;
            showSuggestions();
          } else {
            var greeting = timeAwareGreeting();
            addMessage("bot", greeting);
            showSuggestions();
          }
        }
        hideSuggestions();
        var histPanel = document.getElementById("cc-ai-history-panel");
        if (histPanel) histPanel.classList.remove("open");
      }
    }

    bubble.addEventListener("click", toggle);

    var historyBtn = document.getElementById("cc-ai-history-btn");
    if (historyBtn) {
      historyBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleHistory();
      });
    }

    var newChatBtn = document.getElementById("cc-ai-new-chat");
    if (newChatBtn) {
      newChatBtn.addEventListener("click", function() {
        messagesEl.innerHTML = "";
        messages = [];
        sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          try { localStorage.setItem(SESSION_KEY, sessionId); } catch(e) {}
          loadedHistory = null;
        var histPanel = document.getElementById("cc-ai-history-panel");
        if (histPanel) histPanel.classList.remove("open");
        if (isOpen) {
          var greeting = timeAwareGreeting();
          addMessage("bot", greeting);
          showSuggestions();
        }
      });
    }

    function addMessage(role, content, isSystem) {
      var div = document.createElement("div");
      div.className = "cc-msg " + (isSystem ? "system" : role);
      var htmlContent = content
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
      div.innerHTML = htmlContent;
      if (!isSystem) {
        var timeSpan = document.createElement("span");
        timeSpan.className = "cc-msg-time";
        var now = new Date();
        timeSpan.textContent =
          ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);
        div.appendChild(timeSpan);
      }
      if (VOICE_ENABLED && role === "bot" && !isSystem) {
        var speakerBtn = document.createElement("button");
        speakerBtn.className = "cc-msg-speaker";
        speakerBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
        speakerBtn.title = "Read aloud";
        speakerBtn.style.cssText = "background:none;border:none;cursor:pointer;padding:4px;margin-left:8px;color:#6b7280;vertical-align:middle;border-radius:4px;transition:all 0.2s";
        speakerBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          speakText(content, speakerBtn);
        });
        div.appendChild(speakerBtn);
      }
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      messages.push({ role: role, content: content, timestamp: new Date().toISOString() });
    }

    function showTyping() {
      document.getElementById("cc-ai-typing").style.display = "block";
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
      document.getElementById("cc-ai-typing").style.display = "none";
    }

    function showSuggestions() {
      var s = SUGGESTION_CHIPS;
      var container = document.querySelector(".suggestions-container");
      container.innerHTML = "";
      s.forEach(function(sg) {
        var btn = document.createElement("div");
        btn.className = "cc-suggestion";
        btn.textContent = sg;
        btn.addEventListener("click", function() {
          addMessage("user", sg);
          sendMessageToBot(sg);
          container.style.display = "none";
        });
        container.appendChild(btn);
      });
      document.getElementById("cc-ai-suggestions").style.display = "block";
    }

    async function loadHistory() {
      if (!sessionId) return;
      try {
        var res = await fetch(CHATBOT_BASE + "/api/chat/history?sessionId=" + encodeURIComponent(sessionId));
        if (res.ok) {
          var data = await res.json();
          if (data.messages && data.messages.length > 0) {
            loadedHistory = data.messages.map(function(m) { if (m.role === "assistant") m.role = "bot"; return m; });
          }
        }
      } catch(e) {}
      historyLoaded = true;
    }

    function hideSuggestions() {
      document.getElementById("cc-ai-suggestions").style.display = "none";
    }

    function toggleHistory() {
      var panel = document.getElementById("cc-ai-history-panel");
      if (!panel) return;
      var isOpen = panel.classList.contains("open");
      if (isOpen) {
        panel.classList.remove("open");
      } else {
        panel.classList.add("open");
        if (!conversationsFetched) {
          fetchConversations();
        } else {
          renderConversations(conversations);
        }
      }
    }

    async function fetchConversations() {
      if (!API_KEY) return;
      try {
        var res = await fetch(CHATBOT_BASE + "/api/chat/conversations?apiKey=" + encodeURIComponent(API_KEY));
        if (res.ok) {
          conversations = await res.json();
          conversationsFetched = true;
          renderConversations(conversations);
        }
      } catch(e) {}
    }

    function renderConversations(list) {
      var el = document.getElementById("cc-ai-history-list");
      if (!el) return;
      if (!list || list.length === 0) {
        el.innerHTML = '<div class="cc-history-empty">No past conversations yet</div>';
        return;
      }
      var html = "";
      for (var i = 0; i < list.length; i++) {
        var conv = list[i];
        var time = "";
        try {
          var d = new Date(conv.updatedAt);
          var now = new Date();
          var isToday = d.toDateString() === now.toDateString();
          if (isToday) {
            time = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
          } else {
            time = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth()+1)).slice(-2);
          }
        } catch(e) { time = ""; }
        html += '<div class="cc-history-item" data-session="' + conv.sessionId + '">' +
          '<div class="cc-history-title">' + escapeHtml(conv.title || "New conversation") + '</div>' +
          '<div class="cc-history-meta">' + conv.messageCount + " messages" + (time ? " ? " + time : "") + '</div>' +
          '</div>';
      }
      el.innerHTML = html;

      var items = el.querySelectorAll(".cc-history-item");
      for (var i = 0; i < items.length; i++) {
        items[i].addEventListener("click", function() {
          var sid = this.getAttribute("data-session");
          if (sid) loadConversation(sid);
        });
      }
    }

    function escapeHtml(text) {
      var d = document.createElement("div");
      d.textContent = text;
      return d.innerHTML;
    }

    async function loadConversation(sid) {
      if (!sid) return;
      try {
        var res = await fetch(CHATBOT_BASE + "/api/chat/history?sessionId=" + encodeURIComponent(sid));
        if (res.ok) {
          var data = await res.json();
          if (data.messages && data.messages.length > 0) {
            sessionId = sid;
            try { localStorage.setItem(SESSION_KEY, sessionId); } catch(e) {}
            messagesEl.innerHTML = "";
            messages = [];
            var msgs = data.messages.map(function(m) { if (m.role === "assistant") m.role = "bot"; return m; });
            for (var mi = 0; mi < msgs.length; mi++) {
              addMessage(msgs[mi].role, msgs[mi].content);
            }
            loadedHistory = null;
          }
        }
      } catch(e) {}
      toggleHistory();
    }

    async function handleFileSend() {
      if (!currentFile || !currentFileData) return;
      var text = input.value.trim();
      var fileObj = { name: currentFile.name, type: currentFile.type, data: currentFileData };
      showTyping();
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, 25000);
        var body = JSON.stringify({ message: text || "See attached file", sessionId: sessionId, apiKey: API_KEY, pageUrl: pageUrl, pageType: pageType, attachments: [fileObj] });
        var res = await fetch(CHATBOT_BASE + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: body, signal: controller.signal });
        clearTimeout(timeoutId);
        hideTyping();
        if (res.ok) {
          var data = await res.json();
          var userContent = text || "📎 " + currentFile.name;
          addMessage("user", userContent);
          var reply = data.reply || "Thanks for sharing!";
          addMessage("bot", formatBotReply(reply, data));
          messages.push({ role: "user", content: userContent });
          messages.push({ role: "assistant", content: reply });
          conversation.messages = JSON.stringify(messages);
          input.value = "";
          currentFile = null; currentFileData = null; filePreview.style.display = "none"; document.getElementById("cc-file-input").value = "";
        } else if (res.status === 401) { addMessage("bot", "Chat unavailable: API key is invalid."); }
          else { addMessage("bot", "Sorry, something went wrong. Please try again."); }
      } catch (err) {
        hideTyping();
        if (err.name === "AbortError") { addMessage("bot", "Request timed out. Please try again."); }
        else { addMessage("bot", "Connection error. Please try again."); }
      }
    }

    async function sendMessageToBot(text, retries) {
      if (retries === undefined) retries = 0;
      hideSuggestions();
      userInteractedWithChat = true;
      showTyping();
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, 25000);
        var body = JSON.stringify({ message: text, sessionId: sessionId, apiKey: API_KEY, pageUrl: pageUrl, pageType: pageType });
        var res = await fetch(CHATBOT_BASE + "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        hideTyping();
        if (res.status === 401) {
          addMessage("bot", "Chat unavailable: API key is invalid. Please contact support.");
          return;
        }
        if (res.status === 403) {
          addMessage("bot", "Chat unavailable: workspace is inactive or session expired.");
          return;
        }
        if (res.status === 429) {
          if (retries < 2) {
            addMessage("system", "Busy, retrying...", true);
            setTimeout(function() {
              removeLastMessage();
              sendMessageToBot(text, retries + 1);
            }, 2000);
            return;
          }
          addMessage("bot", "Chat is busy right now. Please try again shortly.");
          return;
        }
        if (res.status >= 500) {
          if (retries < 2) {
            addMessage("system", "Retrying...", true);
            setTimeout(function() {
              removeLastMessage();
              sendMessageToBot(text, retries + 1);
            }, 2000);
            return;
          }
          addMessage("bot", "Chat service temporarily unavailable. Please try again later.");
          return;
        }
        if (!res.ok) {
          addMessage("bot", "Chat temporarily unavailable. Please try again in a moment.");
          return;
        }
        var data = await res.json();
        if (data.reply) {
          addMessage("bot", data.reply);
          if (data.products && data.products.length > 0) {
            renderProductCards(data.products);
          }
        } else if (data.error) {
          addMessage("bot", data.error);
        } else {
          addMessage("bot", "Sorry, I couldn't process your message. Please try again.");
        }
      } catch (err) {
        hideTyping();
        if (err.name === "AbortError") {
          if (retries < 2) {
            addMessage("system", "Request timed out, retrying...", true);
            setTimeout(function() {
              removeLastMessage();
              sendMessageToBot(text, retries + 1);
            }, 2000);
            return;
          }
          addMessage("bot", "Request timed out. Please try again.");
        } else {
          addMessage("bot", "Connection lost. Please try again.");
        }
      }
    }

    function removeLastMessage() {
      if (messagesEl.lastChild) messagesEl.removeChild(messagesEl.lastChild);
      if (messages.length > 0) messages.pop();
    }

    function renderProductCards(products) {
      var container = document.createElement("div");
      container.className = "cc-product-list";
      for (var pi = 0; pi < products.length; pi++) {
        var p = products[pi];
        var item = document.createElement("div");
        item.className = "cc-pl-item";

        var imgDiv = document.createElement("div");
        imgDiv.className = "cc-pl-img";
        if (p.image) {
          var img = document.createElement("img");
          img.src = p.image;
          img.alt = p.name || "";
          img.onerror = function() { this.parentNode.innerHTML = ""; this.parentNode.className = "cc-pl-img cc-pl-img--icon"; };
          imgDiv.appendChild(img);
        } else {
          imgDiv.className = "cc-pl-img cc-pl-img--icon";
          imgDiv.style.background = "rgba(163,230,53,0.12)";
        }
        item.appendChild(imgDiv);

        var info = document.createElement("div");
        info.className = "cc-pl-info";

        var nameEl = document.createElement("a");
        nameEl.className = "cc-pl-name";
        nameEl.href = p.url || "#";
        nameEl.target = "_self";
        nameEl.rel = "noopener";
        nameEl.textContent = p.name || "Product";
        info.appendChild(nameEl);

        if (p.price) {
          var priceEl = document.createElement("div");
          priceEl.className = "cc-pl-price";
          priceEl.textContent = p.price;
          info.appendChild(priceEl);
        }

        item.appendChild(info);

        if (p.url && typeof p.url === "string" && p.url.indexOf("http") === 0) {
          var cartBtn = document.createElement("a");
          cartBtn.className = "cc-pl-cart";
          cartBtn.href = p.url;
          cartBtn.target = "_self";
          cartBtn.rel = "noopener";
          cartBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
          item.appendChild(cartBtn);
        }

        container.appendChild(item);
      }
      messagesEl.appendChild(container);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    var preferredVoice = null;

    function pickBestVoice() {
      var voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return null;

      var priority = [
        "Google UK English Female", "Google UK English Male",
        "Google US English", "Microsoft Jenny Natural",
        "Microsoft Sara", "Microsoft Zira", "Microsoft David",
        "Samantha", "Karen", "Moira", "Tessa",
      ];

      for (var p = 0; p < priority.length; p++) {
        for (var v = 0; v < voices.length; v++) {
          if (voices[v].name.indexOf(priority[p]) !== -1) return voices[v];
        }
      }

      for (var v = 0; v < voices.length; v++) {
        if (voices[v].lang && voices[v].lang.indexOf("en") === 0) return voices[v];
      }

      return voices[0];
    }

    var currentUtterance = null;

    function speakText(text, btn) {
      try {
        if (!window.speechSynthesis) return;

        // Toggle off if already speaking
        if (window.speechSynthesis.speaking && currentUtterance) {
          window.speechSynthesis.cancel();
          currentUtterance = null;
          if (btn) {
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
            btn.style.color = "#6b7280";
          }
          return;
        }

        window.speechSynthesis.cancel();
        if (!preferredVoice) preferredVoice = pickBestVoice();
        var cleanText = text.replace(/\*\*(.+?)\*\*/g, "$1");
        var maxLen = 300;
        var shortText = cleanText.length > maxLen ? cleanText.substring(0, maxLen) + "..." : cleanText;
        var utterance = new SpeechSynthesisUtterance(shortText);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.volume = 1.0;
        if (preferredVoice) utterance.voice = preferredVoice;
        currentUtterance = utterance;
        if (btn) {
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
          btn.style.color = PRIMARY_COLOR;
          utterance.onend = function() {
            currentUtterance = null;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
            btn.style.color = "#6b7280";
          };
          utterance.onerror = function() {
            currentUtterance = null;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
            btn.style.color = "#6b7280";
          };
        }
        window.speechSynthesis.speak(utterance);
      } catch(e) {}
    }

    var recognition = null;
    var isListening = false;
    var voiceResultProcessed = false;

    function startVoiceInput() {
      if (isListening) return;
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        addMessage("bot", "Voice input is not supported in your browser.");
        return;
      }
      voiceResultProcessed = false;
      if (!recognition) {
        recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = function(event) {
          if (voiceResultProcessed) return;
          var lastResult = event.results[event.results.length - 1];
          if (!lastResult.isFinal) return;
          voiceResultProcessed = true;
          var transcript = lastResult[0].transcript.trim();
          if (transcript) {
            addMessage("user", transcript);
            sendMessageToBot(transcript);
          }
          isListening = false;
          if (micBtn) {
            micBtn.style.color = "#6b7280";
            micBtn.style.background = "none";
          }
        };
        recognition.onerror = function(event) {
          isListening = false;
          voiceResultProcessed = true;
          if (micBtn) {
            micBtn.style.color = "#6b7280";
            micBtn.style.background = "none";
          }
          if (event.error !== "no-speech" && event.error !== "aborted") {
            addMessage("system", "Voice input error: " + event.error, true);
          }
        };
        recognition.onend = function() {
          isListening = false;
          if (micBtn) {
            micBtn.style.color = "#6b7280";
            micBtn.style.background = "none";
          }
        };
      }
      try {
        isListening = true;
        var micBtn = document.getElementById("cc-ai-mic");
        if (micBtn) {
          micBtn.style.color = "#ef4444";
          micBtn.style.background = "rgba(239,68,68,0.1)";
        }
        recognition.start();
      } catch(e) {
        isListening = false;
      }
    }

    sendBtn.addEventListener("click", function() {
      var text = input.value.trim();
      if (!text) return;
      addMessage("user", text);
      sendMessageToBot(text);
      input.value = "";
      hideSuggestions();
    });

    input.addEventListener("keypress", function(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        var text = input.value.trim();
        if (!text) return;
        addMessage("user", text);
        sendMessageToBot(text);
        input.value = "";
        hideSuggestions();
      }
    });

    if (VOICE_ENABLED && window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length > 0) {
        preferredVoice = pickBestVoice();
      }
      window.speechSynthesis.onvoiceschanged = function() {
        preferredVoice = pickBestVoice();
      };
    }

    resetInactivityTimer();
  }

  init();
})();
