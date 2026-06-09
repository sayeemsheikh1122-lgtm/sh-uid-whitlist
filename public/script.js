// API endpoint — proxy route through Render backend
const API_PROXY = '/proxy/add_uid';

let total = 0, success = 0, failed = 0;
const historyItems = [];

async function addUID() {
  const uid = document.getElementById('uidInput').value.trim();
  if (!uid) { showResult(false, 'Please enter a UID first.'); return; }

  setLoading(true);
  hideResult();
  total++;
  updateStats();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  try {
    const res = await fetch(API_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    const text = await res.text();
    if (res.ok) {
      success++;
      updateStats();
      showResult(true, 'UID added successfully! ' + (text || ''));
      addHistory(uid, true, timeStr);
      document.getElementById('uidInput').value = '';
    } else {
      failed++;
      updateStats();
      showResult(false, 'Failed (' + res.status + '): ' + (text || 'Unknown error'));
      addHistory(uid, false, timeStr);
    }
  } catch (err) {
    failed++;
    updateStats();
    showResult(false, 'Connection error: ' + err.message);
    addHistory(uid, false, timeStr);
  }
  setLoading(false);
}

function setLoading(state) {
  const btn = document.getElementById('addBtn');
  btn.disabled = state;
  btn.innerHTML = state
    ? '<div class="spinner"></div><span>Sending...</span>'
    : '<i class="ti ti-send"></i><span>Add UID</span>';
}

function showResult(ok, msg) {
  const box = document.getElementById('resultBox');
  box.className = 'result ' + (ok ? 'success' : 'error');
  document.getElementById('resultIcon').className = 'ti ' + (ok ? 'ti-circle-check' : 'ti-alert-circle');
  document.getElementById('resultMsg').textContent = msg;
}

function hideResult() {
  document.getElementById('resultBox').className = 'result hidden';
}

function updateStats() {
  document.getElementById('totalCount').textContent = total;
  document.getElementById('successCount').textContent = success;
  document.getElementById('failCount').textContent = failed;
}

function addHistory(uid, ok, time) {
  historyItems.unshift({ uid, ok, time });
  document.getElementById('historyCard').style.display = 'block';
  document.getElementById('historyList').innerHTML = historyItems.slice(0, 8).map(h => `
    <div class="history-item">
      <span class="h-uid"><i class="ti ti-hash" style="opacity:.4;font-size:12px;margin-right:3px;"></i>${esc(h.uid)}</span>
      <span class="h-badge ${h.ok ? 'ok' : 'fail'}">${h.ok ? 'Success' : 'Failed'}</span>
      <span class="h-time">${h.time}</span>
    </div>
  `).join('');
}

function clearHistory() {
  historyItems.length = 0;
  document.getElementById('historyCard').style.display = 'none';
  document.getElementById('historyList').innerHTML = '';
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uidInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addUID();
  });
});

// Particle animation
(function () {
  const canvas = document.getElementById('dots');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkP() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.5,
      a: Math.random() * 0.55 + 0.1
    };
  }

  function init() { resize(); particles = Array.from({ length: 110 }, mkP); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168,85,247,${p.a})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(168,85,247,${0.1 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  init(); draw();
  window.addEventListener('resize', init);
})();
