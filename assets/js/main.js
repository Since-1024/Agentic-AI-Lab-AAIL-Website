// Basic nav shadow on scroll for subtle depth.
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const toggleShadow = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  };

  toggleShadow();
  window.addEventListener('scroll', toggleShadow);

  initParticles();
});

// 粒子特效
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  const ctx = canvas.getContext('2d');
  let particles = [];
  const linkDistance = 140;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const createParticles = () => {
    const count = Math.min(120, Math.max(60, Math.floor(window.innerWidth / 10)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.2) * 0.35,
      alpha: Math.random() * 0.7 + 0.35
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -p.r) p.y = canvas.height + p.r;
      if (p.y - p.r > canvas.height) p.y = -p.r;
      if (p.x < -p.r) p.x = canvas.width + p.r;
      if (p.x > canvas.width + p.r) p.x = -p.r;

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDistance) {
          const alpha = (1 - dist / linkDistance) * 0.18;
          ctx.strokeStyle = `rgba(11, 39, 90, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(49, 18, 75, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  createParticles();
  document.body.prepend(canvas);
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
  requestAnimationFrame(draw);
}
