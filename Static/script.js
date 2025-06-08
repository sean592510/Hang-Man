const els = {
    c: document.getElementById('hangman'),
    w: document.getElementById('word-display'),
    a: document.getElementById('attempts'),
    g: document.getElementById('guessed-letters'),
    m: document.getElementById('message'),
    i: document.getElementById('letter-input'),
    b: document.getElementById('alphabet')
}, ctx = els.c.getContext('2d'), d = [
    () => { ctx.beginPath(); ctx.moveTo(20,180); ctx.lineTo(180,180); ctx.moveTo(100,180); ctx.lineTo(100,20); ctx.lineTo(150,20); ctx.lineTo(150,40); ctx.stroke(); },
    () => { ctx.beginPath(); ctx.arc(150,60,20,0,Math.PI*2); ctx.stroke(); },
    () => { ctx.beginPath(); ctx.moveTo(150,80); ctx.lineTo(150,120); ctx.stroke(); },
    () => { ctx.beginPath(); ctx.moveTo(150,90); ctx.lineTo(130,110); ctx.stroke(); },
    () => { ctx.beginPath(); ctx.moveTo(150,90); ctx.lineTo(170,110); ctx.stroke(); },
    () => { ctx.beginPath(); ctx.moveTo(150,120); ctx.lineTo(130,140); ctx.stroke(); },
    () => { ctx.beginPath(); ctx.moveTo(150,120); ctx.lineTo(170,140); ctx.stroke(); }
];

function draw(n) {
    ctx.clearRect(0,0,els.c.width,els.c.height); ctx.lineWidth=2; ctx.strokeStyle='#000';
    for (let i=0; i<6-n; i++) d[i]?.();
}

function buttons() {
    const f = document.createDocumentFragment();
    for (let i=65; i<=90; i++) {
        const l = String.fromCharCode(i), b = document.createElement('button');
        b.textContent = l; b.className = 'letter-btn';
        b.addEventListener('click', () => guess(l));
        f.appendChild(b);
    }
    els.b.innerHTML = ''; els.b.appendChild(f);
}

function updateButtons(g) {
    els.b.querySelectorAll('.letter-btn').forEach(b => b.disabled = g.includes(b.textContent));
}

async function guess(l = null) {
    l = l || els.i.value.toUpperCase(); els.i.value = '';
    try {
        const r = await fetch('/guess', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `letter=${l}` });
        const data = await r.json();
        if (data.error) return els.m.textContent = data.error;
        update(data);
    } catch { els.m.textContent = 'Network error.'; }
}

async function reset() {
    try {
        const r = await fetch('/reset', { method: 'POST' });
        const data = await r.json();
        update(data); buttons();
    } catch { els.m.textContent = 'Reset failed.'; }
}

function update(data) {
    els.w.textContent = data.display_word;
    els.a.textContent = `Attempts left: ${data.attempts_left}`;
    els.g.textContent = `Guessed letters: ${data.guessed_letters.join(', ')}`;
    els.m.textContent = '';
    draw(data.attempts_left);
    updateButtons(data.guessed_letters);
    if (data.game_over) {
        els.m.textContent = data.won ? `Won! Word: ${data.word}.` : `Lost! Word: ${data.word}.`;
        els.i.disabled = true;
        els.b.querySelectorAll('.letter-btn').forEach(b => b.disabled = true);
    } else els.i.disabled = false;
}

els.i.addEventListener('keypress', e => e.key === 'Enter' && guess());
(async () => {
    try {
        const r = await fetch('/reset', { method: 'POST' });
        const data = await r.json();
        update(data); buttons();
    } catch { els.m.textContent = 'Init failed.'; }
})();
