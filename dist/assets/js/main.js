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

// 科技感粒子特效
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  
  // 添加样式确保 canvas 显示
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none'; // 改回 none，不接收点击
  canvas.style.zIndex = '1';
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  const linkDistance = 150;
  
  // 鼠标位置追踪
  const mouse = {
    x: null,
    y: null,
    radius: 120 // 鼠标影响范围
  };

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const createParticles = () => {
    const count = Math.min(80, Math.max(40, Math.floor(window.innerWidth / 15)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 1.5,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      baseVx: (Math.random() - 0.5) * 0.15,
      baseVy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.4 + 0.6,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      // 生命周期相关
      life: Math.random(), // 当前生命值 0-1
      lifeSpeed: Math.random() * 0.003 + 0.001, // 生命消耗速度
      maxLife: 1,
      dying: false // 是否正在消失
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      // 生命周期管理
      if (p.dying) {
        p.life -= p.lifeSpeed * 2;
        if (p.life <= 0) {
          // 重生
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.vx = (Math.random() - 0.5) * 0.15;
          p.vy = (Math.random() - 0.5) * 0.15;
          p.baseVx = p.vx;
          p.baseVy = p.vy;
          p.life = 0;
          p.dying = false;
          p.lifeSpeed = Math.random() * 0.003 + 0.001;
        }
      } else {
        p.life += p.lifeSpeed;
        if (p.life >= p.maxLife) {
          p.life = p.maxLife;
          if (Math.random() < 0.002) {
            p.dying = true;
          }
        }
      }

      // 根据生命值调整透明度
      const lifeAlpha = Math.min(p.life, 1);
      const currentAlpha = p.alpha * lifeAlpha;

      // 鼠标交互效果
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < mouse.radius && dist > 0) {
          // 吸引效果 - 更平滑的力度
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          const attractionForce = force * 0.5;
          p.vx += (p.baseVx - Math.cos(angle) * attractionForce - p.vx) * 0.08;
          p.vy += (p.baseVy - Math.sin(angle) * attractionForce - p.vy) * 0.08;
        } else {
          // 恢复原始速度
          p.vx += (p.baseVx - p.vx) * 0.02;
          p.vy += (p.baseVy - p.vy) * 0.02;
        }
      } else {
        // 没有鼠标时也缓慢恢复
        p.vx += (p.baseVx - p.vx) * 0.02;
        p.vy += (p.baseVy - p.vy) * 0.02;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.y < -p.r) p.y = canvas.height + p.r;
      if (p.y - p.r > canvas.height) p.y = -p.r;
      if (p.x < -p.r) p.x = canvas.width + p.r;
      if (p.x > canvas.width + p.r) p.x = -p.r;

      // 绘制连线
      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDistance) {
          let alpha = (1 - dist / linkDistance) * 0.4;
          
          // 根据两个粒子的生命值调整连线透明度
          const combinedLife = Math.min(p.life, q.life);
          alpha *= combinedLife;
          
          // 鼠标附近的连线更明显
          if (mouse.x !== null && mouse.y !== null) {
            const midX = (p.x + q.x) / 2;
            const midY = (p.y + q.y) / 2;
            const distToMouse = Math.hypot(midX - mouse.x, midY - mouse.y);
            if (distToMouse < mouse.radius) {
              alpha *= 1 + (mouse.radius - distToMouse) / mouse.radius;
            }
          }
          
          const gradient = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
          gradient.addColorStop(0, `rgba(120, 170, 220, ${alpha})`);
          gradient.addColorStop(1, `rgba(100, 150, 200, ${alpha * 0.5})`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // 绘制粒子 - 添加微弱脉冲效果
      const pulseScale = 1 + Math.sin(p.pulse) * 0.15;
      const currentRadius = p.r * pulseScale;
      
      // 外层光晕 - 增强效果
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius * 3);
      glow.addColorStop(0, `rgba(140, 180, 240, ${currentAlpha * 0.8})`);
      glow.addColorStop(1, 'rgba(140, 180, 240, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // 粒子核心 - 使用更亮的颜色
      ctx.beginPath();
      ctx.fillStyle = `rgba(200, 230, 255, ${currentAlpha})`;
      ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  createParticles();
  document.body.prepend(canvas);
  
  // 鼠标事件监听 - 只保留移动和离开
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  document.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
  requestAnimationFrame(draw);
}
