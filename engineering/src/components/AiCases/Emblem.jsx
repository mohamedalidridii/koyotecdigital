// One line drawing per case, drawn stroke by stroke when its row is hovered (pathLength = 1).
const PATHS = {
  "rag-document-assistant": [
    "M14 16h22l6 6v30H14z M36 16v6h6",
    "M19 30h16 M19 37h16 M19 44h10",
    "M58 50m-12 0a12 12 0 1 0 24 0a12 12 0 1 0 -24 0",
    "M67 59l8 8",
    "M52 48l4 4 7-8",
  ],
  "graphrag-knowledge-engine": [
    "M20 22 L50 14 L74 34 L56 62 L26 58 Z",
    "M20 22 L56 62 M50 14 L26 58 M74 34 L26 58",
    "M20 22m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0",
    "M50 14m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
    "M74 34m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0",
    "M56 62m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
    "M26 58m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0",
  ],
  "onboarding-agents": [
    "M40 14m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    "M40 23 V36 M14 36 H66 M14 36 V46 M32 36 V46 M48 36 V46 M66 36 V46",
    "M8 46h12v12h-12z M26 46h12v12h-12z M42 46h12v12h-12z M60 46h12v12h-12z",
    "M11 66l3 3 5-6 M29 66l3 3 5-6 M45 66l3 3 5-6 M63 66l3 3 5-6",
  ],
  "compliance-agent": [
    "M28 12 L48 12 L56 20 L56 52 L28 52 Z M48 12 V20 H56",
    "M33 26 H50 M33 33 H50 M33 40 H44",
    "M58 50m-14 0a14 14 0 1 0 28 0a14 14 0 1 0 -28 0",
    "M44 50 H72 M58 36 C52 44 52 56 58 64 M58 36 C64 44 64 56 58 64",
    "M10 60 L20 66 L34 54",
  ],
  "shopping-assistant": [
    "M20 26 H60 L64 68 H16 Z",
    "M30 26 C30 12 50 12 50 26",
    "M26 40 L40 52 L54 40",
    "M66 10 H76 V20 M76 10 L62 24",
  ],
  "vlm-document-extraction": [
    "M12 22V12h10 M58 12h10v10 M68 58v10H58 M22 68H12V58",
    "M26 16h22l8 8v40H26z M48 16v8h8",
    "M31 32h20 M31 40h20 M31 48h12",
    "M8 42H72",
  ],
  "text-to-sql-agent": [
    "M12 20c0-6 26-6 26 0v36c0 6-26 6-26 0z",
    "M12 20c0 6 26 6 26 0 M12 38c0 6 26 6 26 0",
    "M46 14h26v20H58l-6 6v-6h-6z",
    "M50 70V60 M60 70V52 M70 70V46",
  ],
  "legacy-modernization": [
    "M8 18h24v44H8z M13 28h12 M13 36h14 M13 44h9",
    "M48 18h24v44H48z M53 28h12 M53 36h8 M53 44h14",
    "M35 40h10 M41 35l5 5-5 5",
    "M54 54l3 3 6-7",
  ],
  "soc-triage-agent": [
    "M40 10l24 9v17c0 16-10 26-24 32-14-6-24-16-24-32V19z",
    "M40 26v18",
    "M40 51v2",
    "M8 72h16 M30 72h20 M56 72h16",
  ],
  "supply-chain-radar": [
    "M40 40m-24 0a24 24 0 1 0 48 0a24 24 0 1 0 -48 0",
    "M16 40h48 M40 16c-10 8-10 40 0 48 M40 16c10 8 10 40 0 48",
    "M64 16m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0",
    "M24 58l8-8 8 4 12-12",
  ],
  "rag-evaluation": [
    "M12 66 H70",
    "M18 66 V46 M30 66 V36 M42 66 V28 M54 66 V18",
    "M10 30 H72",
    "M14 22 L28 30 L42 18 L56 12",
    "M64 46m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M60 46 l3 3 5 -6",
  ],
};

export default function Emblem({ slug, className }) {
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      {(PATHS[slug] || []).map((d, i) => (
        <path key={i} d={d} pathLength="1" style={{ "--i": i }} />
      ))}
    </svg>
  );
}
