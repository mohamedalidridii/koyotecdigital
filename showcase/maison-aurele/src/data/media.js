// Maison Aurèle imagery: Unsplash photos (Unsplash License) downloaded by
// scripts/import-stock.mjs. Photographers are listed in src/data/credits.js.
const a = (path) => `/aurele/${path}.jpg`;

export const aurele = {
  // Lookbook order: gowns first, then tailoring and the salon portraits
  looks: [
    "pieces/robe-or-brodee",
    "pieces/fourreau-fleurs-or",
    "pieces/robe-bustier-pourpre-1",
    "pieces/robe-manches-cloche",
    "pieces/robe-bal-tulle",
    "pieces/robe-noire-brodee-1",
    "pieces/robe-cape-faille-1",
    "pieces/sirene-sequins-or",
    "looks/salon-dore",
    "pieces/smoking-noir-1",
    "pieces/robe-satin-noir",
    "pieces/robe-bal-ivoire-1",
    "looks/volants-ivoire",
    "pieces/robe-bustier-pourpre-3",
    "pieces/robe-cape-faille-3",
    "pieces/smoking-noir-2",
    "pieces/robe-noire-brodee-2",
    "pieces/bustier-sculpte",
    "looks/velours-rouge",
    "pieces/robe-volants-1",
    "pieces/robe-manteau-velours-1",
  ].map(a),
  // The Fil d'or show
  runway: ["passage-rouge", "podium-lavande-2", "passage-traine", "podium-bleu", "passage-lumiere", "passage-ivoire", "premier-rang", "passage-fourrure", "passage-blanc"].map((n) => a(`defile/${n}`)),
  frontRow: ["premier-rang", "coulisses-nb", "coulisses-couloir", "coulisses-maquillage", "podium-or", "coulisses-cape", "podium-bleu", "passage-lumiere"].map((n) => a(`defile/${n}`)),
};

// Hand-picked frames reused across sections
export const img = {
  hero: a("pieces/robe-or-brodee"),
  salon: a("defile/salon-or"),
  salonBlue: a("defile/salon-bleu"),
  salonPortrait: a("looks/salon-dore"),
  atelierDoor: a("atelier/porte"),
  atelier: a("atelier/tailleur"),
  drape: a("atelier/drape"),
  fitting: a("atelier/essayage"),
  mannequin: a("atelier/mannequin"),
  thread: a("atelier/fil"),
  gownHanger: a("atelier/robe-cintre"),
  toiles: a("atelier/toiles"),
  goldGown: a("pieces/robe-or-brodee"),
  sequinGown: a("pieces/sirene-sequins-or"),
  goldFlowers: a("pieces/fourreau-fleurs-or"),
  bellSleeves: a("pieces/robe-manches-cloche"),
  velvet: a("pieces/robe-manteau-velours-1"),
  ivoryGown: a("pieces/robe-bal-ivoire-1"),
  embroidery: a("details/broderie-or"),
  beading: a("details/perlage"),
  button: a("details/bouton"),
  hand: a("details/main"),
  goldLace: a("details/dentelle-or"),
  // Full-screen curtain: wide frame for landscape screens, portrait for phones
  stage: a("defile/podium-or"),
  stageMobile: a("defile/podium-noir"),
  runwayRed: a("defile/podium-rouge"),
  runwayWide: a("defile/podium-lavande-2"),
  backstage: a("defile/coulisses-essayage"),
  backstageHair: a("defile/coulisses-coiffure"),
  backstageCape: a("defile/coulisses-cape"),
  backstageMakeup: a("defile/coulisses-maquillage"),
};
