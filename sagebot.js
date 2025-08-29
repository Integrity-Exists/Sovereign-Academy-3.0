// /sagebot.js — unified chat + voice
(function () {
  const API = '/api/ask-sage';
  const d = document;

  const form  = d.getElementById('sage-composer');
  const input = d.getElementById('sage-input');
  const msgs  = d.getElementById('sage-messages');
  const mic   = d.getElementById('sage-mic');

  if (!form || !input || !msgs) {
    console.warn('SageBot: missing required elements'); return;
  }

  function addMsg(role, text) {
    const el = d.createElement('article');
    el.className = 'sage-msg ' + role;
    el.innerHTML = `<div class="meta">${role === 'user' ? 'You' : 'Sage'}</div><div class="txt"></div>`;
    el.querySelector('.txt').textContent = text;
    msgs.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    return el;
  }

  async function send(prompt) {
    const hold = addMsg('sage', 'Thinking…');
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await r.json().catch(() => ({}));
      hold.querySelector('.txt').textContent =
        data.response || data.error || 'No response.';
    } catch (e) {
      hold.querySelector('.txt').textContent = 'Network error. Try again.';
    }
  }

  // Submit handling
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const prompt = (input.value || '').trim();
    if (!prompt) return;
    addMsg('user', prompt);
    input.value = '';
    send(prompt);
  });

  // Cmd/Ctrl + Enter to send
  input.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') form.requestSubmit();
  });

  // Voice dictation
  (function voice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!mic) return;
    if (!SR) { mic.style.display = 'none'; return; }

    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let listening = false, sendTimer = null;

    function start() { try { rec.start(); } catch (_) {} }
    function stop()  { try { rec.stop();  } catch (_) {} }

    rec.onstart = () => { listening = true; mic.setAttribute('aria-pressed','true'); mic.textContent = '🛑 Stop'; };
    rec.onend   = () => { listening = false; mic.setAttribute('aria-pressed','false'); mic.textContent = '🎤 Voice'; };
    rec.onerror = () => { listening = false; mic.setAttribute('aria-pressed','false'); mic.textContent = '🎤 Voice'; };

    rec.onresult = (e) => {
      const t = Array.from(e.results).map(x => x[0].transcript).join(' ').trim();
      input.value = t;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      clearTimeout(sendTimer);
      if (e.results[e.results.length - 1].isFinal && t) {
        const formEl = input.form;
        if (formEl && typeof formEl.requestSubmit === 'function') {
          sendTimer = setTimeout(() => formEl.requestSubmit(), 350);
        }
      }
    };

    mic.addEventListener('click', () => (listening ? stop() : start()));
    mic.addEventListener('mousedown', () => { if (!listening) start(); });
    ['mouseup','mouseleave','touchend','touchcancel']
      .forEach(ev => mic.addEventListener(ev, () => { if (listening) stop(); }));
  })();
})();
