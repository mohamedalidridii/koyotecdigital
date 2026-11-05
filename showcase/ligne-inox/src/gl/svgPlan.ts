import { dimLabels, flowPoints, PLAN_H, PLAN_W, segments, zoneRects } from './layout';

const names = ['Réception', 'Stockage', 'Préparation', 'Cuisson', 'Service', 'Plonge'];
const f = (n: number) => n.toFixed(2);

/** The same plan as the WebGL one, as a static SVG: used without WebGL or with reduced motion. */
export function svgPlan(className = 'svg-plan') {
  const byKind = (k: string) =>
    segments
      .filter((s) => s.kind === k)
      .map((s) => `M${f(s.a[0])} ${f(s.a[1])}L${f(s.b[0])} ${f(s.b[1])}`)
      .join('');
  const flow = 'M' + flowPoints.filter((_, i) => i % 3 === 0 || i === flowPoints.length - 1).map((p) => `${f(p[0])} ${f(p[1])}`).join('L');
  const zones = zoneRects
    .map((z, i) => `<text class="svg-plan__zone" x="${f(z.x + 0.28)}" y="${f(z.y + 0.55)}">Z-0${i + 1} ${names[i]}</text>`)
    .join('');
  const dims = dimLabels.map((d) => `<text class="svg-plan__dim" x="${f(d.p[0])}" y="${f(d.p[1] + 0.1)}" text-anchor="middle">${d.text}</text>`).join('');
  return `
  <svg class="${className}" viewBox="-2 -1.6 ${PLAN_W + 3.6} ${PLAN_H + 2.6}" role="img" aria-label="Plan d’une cuisine professionnelle : réception, stockage, préparation, cuisson, service, plonge, reliés par la marche en avant.">
    <path class="svg-plan__wall" d="${byKind('wall')}"/>
    <path class="svg-plan__door" d="${byKind('door')}"/>
    <path class="svg-plan__equip" d="${byKind('equip')}"/>
    <path class="svg-plan__dimline" d="${byKind('dim')}"/>
    <path class="svg-plan__flow" d="${flow}" pathLength="1"/>
    ${zones}${dims}
  </svg>`;
}
