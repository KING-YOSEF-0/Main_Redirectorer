const COLORS = ['#ff4fa3', '#ff9f1c', '#ffe14d', '#2ee6a6', '#35c3ff', '#9b5cff'];
const rand = (a, b) => Math.random() * (b - a) + a;
const bubbleLayer = document.getElementById('bubbles');

// Floating background bubbles
function spawnBubble() {
  const b = document.createElement('div');
  const size = rand(20, 90);
  b.className = 'float';
  b.style.cssText = `width:${size}px;height:${size}px;left:${rand(0, 100)}%;` +
    `--c:${COLORS[Math.floor(rand(0, COLORS.length))]};--dx:${rand(-80, 80)}px;` +
    `animation-duration:${rand(8, 16)}s`;
  bubbleLayer.appendChild(b);
  b.addEventListener('animationend', () => b.remove());
}
setInterval(spawnBubble, 600);
for (let i = 0; i < 8; i++) setTimeout(spawnBubble, i * 150);

// Burst of mini bubbles at a point
function burst(x, y, n = 14) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('span');
    const angle = (Math.PI * 2 * i) / n, dist = rand(40, 100);
    p.className = 'pop';
    p.style.cssText = `left:${x}px;top:${y}px;background:${COLORS[i % COLORS.length]};` +
      `--x:${Math.cos(angle) * dist}px;--y:${Math.sin(angle) * dist}px`;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

// Tap anywhere to pop bubbles
document.addEventListener('pointerdown', e => burst(e.clientX, e.clientY, 8));

// Buttons: ripple + burst, then go straight to the website
document.querySelectorAll('.bubble-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const r = btn.getBoundingClientRect();
    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.cssText = `width:40px;height:40px;left:${e.clientX - r.left - 20}px;top:${e.clientY - r.top - 20}px`;
    btn.appendChild(rip);
    burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 20);
    setTimeout(() => { window.location.href = btn.dataset.url; }, 350);
  });
});

// Logo: rainbow party when clicked
document.querySelector('.logo').addEventListener('click', () => {
  for (let i = 0; i < 12; i++) setTimeout(spawnBubble, i * 60);
});