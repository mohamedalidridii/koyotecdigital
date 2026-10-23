import { CARTOUCHE, LETTER, NEEDLE, THREAD, EMBLEM_BOX, LETTERS, WORDMARK_BOX, TAGLINE, TAGLINE_BOX } from "./paths";

// Hairlines would vanish at icon sizes: a non-scaling outline keeps them visible
const hairline = { stroke: "currentColor", strokeWidth: 0.6, vectorEffect: "non-scaling-stroke" };

// Emblem: Didone "A" in an oval cartouche, a gold needle for its crossbar.
// `accent` colours the needle and thread (defaults to the site gold).
export const Emblem = ({ className = "", accent = "var(--gold, currentColor)" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={EMBLEM_BOX} className={className} fill="currentColor" aria-hidden="true">
    <path className="emblem-cartouche" d={CARTOUCHE} fillRule="evenodd" style={hairline} />
    <path className="emblem-letter" d={LETTER} style={hairline} />
    <path
      className="emblem-thread"
      d={THREAD}
      fill="none"
      style={{ stroke: accent, strokeWidth: 1, vectorEffect: "non-scaling-stroke", strokeLinecap: "round" }}
    />
    <path className="emblem-needle" d={NEEDLE} fillRule="evenodd" style={{ fill: accent }} />
  </svg>
);

// Wordmark: "MAISON AURÈLE"
export const Wordmark = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={WORDMARK_BOX}
    className={className}
    fill="currentColor"
    role="img"
    aria-label="Maison Aurèle"
  >
    <path d={LETTERS} />
  </svg>
);

// Full lockup: emblem over the wordmark and the "Haute couture · Paris" line
const BrandIcon = ({ className = "", accent = "var(--gold, currentColor)", title = "Maison Aurèle" }) => {
  const [, , ww] = WORDMARK_BOX.split(" ").map(Number);
  const [, , tw] = TAGLINE_BOX.split(" ").map(Number);
  const W = Math.ceil(ww) + 40;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} 1060`} className={className} fill="currentColor" role="img" aria-label={title}>
      <g transform={`translate(${(W - 560) / 2} 0) scale(0.56)`}>
        <path d={CARTOUCHE} fillRule="evenodd" />
        <path d={LETTER} />
        <path d={THREAD} fill="none" style={{ stroke: accent, strokeWidth: 3, strokeLinecap: "round" }} />
        <path d={NEEDLE} fillRule="evenodd" style={{ fill: accent }} />
      </g>
      <path d={LETTERS} transform={`translate(${(W - ww) / 2} 700)`} />
      <path d={TAGLINE} transform={`translate(${(W - tw) / 2} 980)`} style={{ fill: accent }} />
    </svg>
  );
};

export default BrandIcon;
