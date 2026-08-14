(function() {
  if (document.getElementById('circucity-chat-widget')) return;

  var baseUrl = document.currentScript?.getAttribute('data-url') || 'https://circucity.com';
  var storeId = document.currentScript?.getAttribute('data-store-id') || '';

  var style = document.createElement('style');
  style.id = 'circucity-chat-style';
  style.textContent = `
    #circucity-chat-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 56px; height: 56px; border-radius: 50%; background: #2D5F3F; color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      font-size: 24px; transition: transform 0.2s;
    }
    #circucity-chat-bubble:hover { transform: scale(1.05); }
    #circucity-chat-frame {
      display: none; position: fixed; bottom: 96px; right: 24px; z-index: 99998;
      width: 400px; height: 550px; max-height: 70vh; border: none; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2); background: white;
    }
    @media (max-width: 480px) {
      #circucity-chat-frame { width: 100vw; right: 0; bottom: 80px; height: calc(100vh - 80px); border-radius: 12px 12px 0 0; }
    }
  `;
  document.head.appendChild(style);

  function createEl(tag, attrs) {
    var el = document.createElement(tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var bubble = createEl('button', { id: 'circucity-chat-bubble', 'aria-label': 'Open chat' });
  bubble.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

  var frame = createEl('iframe', { id: 'circucity-chat-frame', src: baseUrl + '/help-center?embed=1' });

  var isOpen = false;
  bubble.addEventListener('click', function() {
    isOpen = !isOpen;
    frame.style.display = isOpen ? 'block' : 'none';
    bubble.innerHTML = isOpen
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  });

  document.body.appendChild(bubble);
  document.body.appendChild(frame);
})();
