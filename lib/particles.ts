export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  type: 'spark' | 'glow' | 'trail';
}

export class ParticleSystem {
  private particles: Particle[] = [];

  addParticles(
    x: number,
    y: number,
    color: string,
    count: number = 10,
    type: 'spark' | 'glow' | 'trail' = 'spark'
  ) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 1 + Math.random() * 3;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: type === 'glow' ? 40 : 20,
        radius: type === 'glow' ? 6 : 3,
        color,
        type,
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      const progress = p.life / p.maxLife;
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'glow') {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1 - progress * 0.3), 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
    });
  }

  clear() {
    this.particles = [];
  }
}
