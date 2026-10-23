// Maison Aurèle — Haute Couture Printemps-Été 2027 « Fil d'or ».
// Pieces written around the Unsplash photos in public/aurele.
const p = (name) => `/aurele/pieces/${name}.jpg`;
const d = (name) => `/aurele/details/${name}.jpg`;

export const categories = ["all", "gowns", "embroidery", "tailoring"];

export const pieces = [
  {
    slug: "robe-or-brodee",
    category: "embroidery",
    name: { fr: "Robe du soir brodée d'or", en: "Gold-Embroidered Evening Gown" },
    material: { fr: "Tulle de soie, broderie au fil d'or", en: "Silk tulle, gold-thread embroidery" },
    colour: { fr: "Or, chair", en: "Gold, nude" },
    description: {
      fr: "La pièce manifeste de la collection : une robe à manches longues en tulle couleur chair, entièrement brodée de rinceaux d'or jusqu'à l'ourlet de sa jupe ample. Plus de quatre cents heures de travail à la main.",
      en: "The collection's manifesto piece: a long-sleeved gown in nude tulle, embroidered with gold scrolls down to the hem of its full skirt. More than four hundred hours of handwork.",
    },
    images: [p("robe-or-brodee"), d("broderie-or"), d("dentelle-or")],
  },
  {
    slug: "fourreau-fleurs-or",
    category: "embroidery",
    name: { fr: "Fourreau noir, fleurs d'or", en: "Black Sheath, Gold Flowers" },
    material: { fr: "Crêpe de soie, fleurs sculptées en métal doré", en: "Silk crêpe, sculpted gilded-metal flowers" },
    colour: { fr: "Noir velours, or", en: "Velvet black, gold" },
    description: {
      fr: "Un fourreau sans bretelles qui s'évase en traîne, rehaussé d'une guirlande de fleurs d'or sculptées à la main qui court de la taille à l'épaule.",
      en: "A strapless sheath flaring into a train, lifted by a garland of hand-sculpted gold flowers running from the waist to the shoulder.",
    },
    images: [p("fourreau-fleurs-or")],
  },
  {
    slug: "robe-bustier-pourpre",
    category: "gowns",
    name: { fr: "Robe bustier pourpre", en: "Crimson Bustier Gown" },
    material: { fr: "Satin duchesse, plumes", en: "Duchess satin, feathers" },
    colour: { fr: "Pourpre", en: "Crimson" },
    description: {
      fr: "Un bustier architecturé aux pétales de satin, une jupe longue qui tombe droit : la rigueur du corset et la douceur de la plume.",
      en: "An architectural bustier of satin petals over a long, straight skirt: the rigour of the corset and the softness of feathers.",
    },
    images: [p("robe-bustier-pourpre-1"), p("robe-bustier-pourpre-2"), p("robe-bustier-pourpre-3")],
  },
  {
    slug: "robe-manches-cloche",
    category: "embroidery",
    name: { fr: "Robe d'or à manches cloche", en: "Gold Bell-Sleeve Gown" },
    material: { fr: "Organza de soie, broderie florale", en: "Silk organza, floral embroidery" },
    colour: { fr: "Champagne, or", en: "Champagne, gold" },
    description: {
      fr: "Des manches cloche qui s'ouvrent comme des corolles et une jupe semée de fleurs brodées au fil d'or, du décolleté jusqu'à l'ourlet.",
      en: "Bell sleeves that open like petals and a skirt scattered with gold-thread flowers, from neckline to hem.",
    },
    images: [p("robe-manches-cloche")],
  },
  {
    slug: "robe-bal-tulle",
    category: "embroidery",
    name: { fr: "Robe de bal en tulle brodé", en: "Embroidered Tulle Ball Gown" },
    material: { fr: "Tulle de soie, appliqués de velours", en: "Silk tulle, velvet appliqués" },
    colour: { fr: "Bordeaux", en: "Burgundy" },
    description: {
      fr: "Un bustier sans bretelles et une jupe de tulle aérienne, parsemée d'appliqués de velours posés un à un à la main.",
      en: "A strapless bodice and an airy tulle skirt, scattered with velvet appliqués set one by one by hand.",
    },
    images: [p("robe-bal-tulle")],
  },
  {
    slug: "robe-noire-brodee",
    category: "embroidery",
    name: { fr: "Robe noire au col brodé", en: "Black Gown, Embroidered Collar" },
    material: { fr: "Dentelle de Calais, tulle illusion", en: "Calais lace, illusion tulle" },
    colour: { fr: "Noir", en: "Black" },
    description: {
      fr: "Une robe longue fendue dont le décolleté en tulle illusion est brodé de dentelle, comme un bijou posé sur la peau.",
      en: "A long slit gown whose illusion-tulle neckline is embroidered with lace, like a jewel resting on the skin.",
    },
    images: [p("robe-noire-brodee-1"), p("robe-noire-brodee-2"), p("robe-noire-brodee-3")],
  },
  {
    slug: "robe-cape-faille",
    category: "gowns",
    name: { fr: "Robe-cape en faille", en: "Faille Cape Gown" },
    material: { fr: "Faille de soie", en: "Silk faille" },
    colour: { fr: "Anthracite", en: "Charcoal" },
    description: {
      fr: "Des manches-cape sculptées et une jupe sirène qui se déploie en traîne : la silhouette la plus théâtrale de la saison.",
      en: "Sculpted cape sleeves and a mermaid skirt unfolding into a train: the season's most theatrical silhouette.",
    },
    images: [p("robe-cape-faille-1"), p("robe-cape-faille-2"), p("robe-cape-faille-3")],
  },
  {
    slug: "sirene-sequins-or",
    category: "embroidery",
    name: { fr: "Robe sirène pailletée d'or", en: "Gold-Sequinned Mermaid Gown" },
    material: { fr: "Tulle brodé de paillettes", en: "Sequin-embroidered tulle" },
    colour: { fr: "Or pâle", en: "Pale gold" },
    description: {
      fr: "Une sirène entièrement pailletée à la main, qui capte la lumière des lustres à chaque pas.",
      en: "A mermaid gown sequinned entirely by hand, catching the chandelier light with every step.",
    },
    images: [p("sirene-sequins-or")],
  },
  {
    slug: "robe-volants",
    category: "gowns",
    name: { fr: "Robe à volants en taffetas", en: "Ruffled Taffeta Gown" },
    material: { fr: "Taffetas de soie", en: "Silk taffeta" },
    colour: { fr: "Noir", en: "Black" },
    description: {
      fr: "Des épaules dénudées et une cascade de volants asymétriques : le taffetas sculpte le mouvement.",
      en: "Bare shoulders and a cascade of asymmetric ruffles: taffeta sculpts the movement.",
    },
    images: [p("robe-volants-1"), p("robe-volants-2")],
  },
  {
    slug: "robe-bal-ivoire",
    category: "gowns",
    name: { fr: "Robe de bal ivoire", en: "Ivory Ball Gown" },
    material: { fr: "Mikado de soie", en: "Silk mikado" },
    colour: { fr: "Ivoire", en: "Ivory" },
    description: {
      fr: "Un bustier drapé et une jupe ample en mikado, d'une blancheur profonde : la robe de cérémonie de la Maison.",
      en: "A draped bodice and a full mikado skirt in a deep white: the Maison's ceremonial gown.",
    },
    images: [p("robe-bal-ivoire-1"), p("robe-bal-ivoire-2")],
  },
  {
    slug: "robe-satin-noir",
    category: "gowns",
    name: { fr: "Fourreau en satin noir", en: "Black Satin Sheath" },
    material: { fr: "Satin de soie", en: "Silk satin" },
    colour: { fr: "Noir", en: "Black" },
    description: {
      fr: "Bretelles fines, ligne coupée dans le biais, fente haute : l'essentiel de la Maison, sans un ornement de trop.",
      en: "Fine straps, a bias-cut line, a high slit: the Maison's essential, without a single ornament too many.",
    },
    images: [p("robe-satin-noir")],
  },
  {
    slug: "smoking-noir",
    category: "tailoring",
    name: { fr: "Smoking noir", en: "Black Tuxedo" },
    material: { fr: "Grain de poudre de laine, revers satin", en: "Wool grain de poudre, satin lapels" },
    colour: { fr: "Noir", en: "Black" },
    description: {
      fr: "Le smoking de la Maison, coupé pour elle : épaules nettes, taille marquée, pantalon long et fluide. Boutons gravés au monogramme.",
      en: "The Maison's tuxedo, cut for her: sharp shoulders, marked waist, long fluid trousers. Monogram-engraved buttons.",
    },
    images: [p("smoking-noir-1"), p("smoking-noir-2"), d("bouton")],
  },
  {
    slug: "bustier-sculpte",
    category: "tailoring",
    name: { fr: "Bustier à manches sculptées", en: "Sculpted-Sleeve Bustier" },
    material: { fr: "Taffetas, découpes de tulle", en: "Taffeta, tulle cut-outs" },
    colour: { fr: "Noir", en: "Black" },
    description: {
      fr: "Des manches bouffantes travaillées comme des pétales et des découpes de tulle : un haut de couture qui se porte comme une veste.",
      en: "Puffed sleeves worked like petals and tulle cut-outs: a couture top worn like a jacket.",
    },
    images: [p("bustier-sculpte")],
  },
  {
    slug: "robe-manteau-velours",
    category: "tailoring",
    name: { fr: "Robe-manteau en velours", en: "Velvet Coat Dress" },
    material: { fr: "Velours de soie, col satin", en: "Silk velvet, satin collar" },
    colour: { fr: "Noir velours", en: "Velvet black" },
    description: {
      fr: "Un manteau qui se porte comme une robe : le velours de soie, profond et souple, tient la lumière comme peu de matières.",
      en: "A coat worn as a dress: deep, supple silk velvet holds the light like few fabrics can.",
    },
    images: [p("robe-manteau-velours-1"), p("robe-manteau-velours-2")],
  },
];

export const getPiece = (slug) => pieces.find((piece) => piece.slug === slug);
