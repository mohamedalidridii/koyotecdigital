"use client";
import { useEffect, useRef } from "react";

// Slow-falling feathers on a 2D canvas. Pauses off-screen.
export default function Feathers({ count = 26, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const spawn = (initial) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -40,
      size: 14 + Math.random() * 26,
      speed: 0.25 + Math.random() * 0.55,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.006 + Math.random() * 0.01,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.01,
      alpha: 0.35 + Math.random() * 0.5,
    });
    const feathers = Array.from({ length: count }, () => spawn(true));

    const drawFeather = (f) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = f.alpha;
      const s = f.size;
      // vane
      const grad = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, "rgba(255,252,245,0.95)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.45, -s * 0.5, s * 0.35, s * 0.4, 0, s * 0.7);
      ctx.bezierCurveTo(-s * 0.35, s * 0.4, -s * 0.45, -s * 0.5, 0, -s);
      ctx.fill();
      // quill
      ctx.strokeStyle = "rgba(220,192,138,0.7)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.95);
      ctx.quadraticCurveTo(s * 0.05, 0, 0, s);
      ctx.stroke();
      ctx.restore();
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      feathers.forEach((f, i) => {
        f.sway += f.swaySpeed;
        f.y += f.speed;
        f.x += Math.sin(f.sway) * 0.6;
        f.rot += f.spin + Math.cos(f.sway) * 0.003;
        if (f.y > h + 50) feathers[i] = spawn(false);
        drawFeather(f);
      });
    };
    tick();

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={ref} className={`feathers ${className}`} aria-hidden="true" />;
}
