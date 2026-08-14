'use client';

import { useState, useEffect, useRef } from 'react';

export function RagChatWidget() {
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [checkDone, setCheckDone] = useState(false);
  const injected = useRef(false);

  useEffect(() => {
    fetch('/api/chatbot-config')
      .then(r => r.json())
      .then(d => {
        if (d.enabled && d.apiKey) {
          setEnabled(true);
          setApiKey(d.apiKey);
          setWorkspaceId(d.workspaceId || '');
        }
      })
      .catch(() => {})
      .finally(() => setCheckDone(true));
  }, []);

  useEffect(() => {
    if (!checkDone || !enabled || !apiKey || injected.current) return;

    if (
      injected.current ||
      (window as any).__ccAiWidgetInstance ||
      document.getElementById('cc-ai-widget') ||
      document.querySelector('script[data-cc-ai-widget]')
    ) {
      injected.current = true;
      return;
    }

    const query = workspaceId
      ? `?key=${encodeURIComponent(apiKey)}&workspace_id=${encodeURIComponent(workspaceId)}`
      : `?key=${encodeURIComponent(apiKey)}`;

    const script = document.createElement('script');
    script.src = `https://chatbot.circucity.com/api/widget${query}`;
    script.dataset.ccAiWidget = '';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    injected.current = true;
  }, [checkDone, enabled, apiKey, workspaceId]);

  return null;
}
