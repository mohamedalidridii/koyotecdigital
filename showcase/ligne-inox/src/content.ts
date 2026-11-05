// All site copy, in French. "Ligne Inox" is a fictional design office: a KOYOTEC concept for a professional
// kitchen & laundry consultancy. Names, contact details and texts are invented for the showcase.
// `*word*` marks the italic serif accent inside titles.

/** Base path the site is served from (the concept lives under /art-de-la-difference/ligne-inox/). */
export const BASE = import.meta.env.BASE_URL;
/** Public address, for social cards. */
export const SITE = 'https://www.koyotec.digital/art-de-la-difference/ligne-inox';

export const BRAND = 'Ligne Inox';

export const contact = {
  email: 'bonjour@ligne-inox.tn',
  phone: '71 000 000',
  phoneIntl: '+21671000000',
  phoneDisplay: '+216 71 000 000',
  address: 'Montplaisir, Tunis',
};

/** Title and description of each page: used in the built HTML and when the router swaps pages. */
export const seo = {
  home: {
    path: '',
    title: 'Ligne Inox — Bureau d’études cuisines & buanderies professionnelles · Concept KOYOTEC',
    description:
      'Ligne Inox, bureau d’études imaginé par KOYOTEC : plans d’aménagement de cuisines et buanderies professionnelles, marche en avant, cahiers des charges et suivi de chantier.',
  },
  about: {
    path: 'a-propos/',
    title: 'À propos — Ligne Inox · Concept KOYOTEC',
    description: 'Un bureau d’études obsédé par le flux : chaque cuisine et chaque buanderie dessinée pour que rien ne revienne en arrière.',
  },
  services: {
    path: 'services/',
    title: 'Services — Plans, cahiers des charges, suivi · Ligne Inox',
    description: 'Programme des besoins, plans d’implantation, réseaux, consultation des équipementiers et réception du matériel.',
  },
  contact: {
    path: 'contact/',
    title: 'Contact — Ligne Inox · Concept KOYOTEC',
    description: 'Parlons de votre projet de cuisine ou de buanderie professionnelle.',
  },
} as const;

export const audience = ['Hôtels', 'Restaurants', 'Cliniques', 'Écoles', 'Laboratoires', 'Restauration collective', 'Investisseurs'];

export const expertise = [
  'Programme des besoins et des usages',
  'Plans d’implantation des équipements',
  'Plans des réseaux électriques',
  'Plans des fluides : eau, gaz, évacuations',
  'Circulations et marche en avant',
  'Cahiers des charges et dossiers d’appel d’offres',
  'Accompagnement dans le choix des équipements',
  'Suivi de chantier et réception',
];

export const sectors = ['Hôtellerie', 'Restaurants', 'Cliniques', 'Écoles', 'Pâtisseries', 'Boulangeries', 'Collectivités', 'Investisseurs'];

/** The six zones of the plan, in the order the flow crosses them. */
export const zones = [
  { code: 'Z-01', name: 'Réception', text: 'Les marchandises entrent, sont contrôlées et pesées. Rien ne remonte plus jamais ce chemin.' },
  { code: 'Z-02', name: 'Stockage', text: 'Chambres froides et réserves sèches, placées pour que chaque produit avance vers la préparation.' },
  { code: 'Z-03', name: 'Préparation', text: 'Postes de travail séparés : le cru et le prêt à cuire ne se croisent pas.' },
  { code: 'Z-04', name: 'Cuisson', text: 'La ligne chaude, son extraction, ses circulations. L’espace est optimisé au centimètre.' },
  { code: 'Z-05', name: 'Service', text: 'Le passe distribue vers la salle. Le propre sort, il ne revient pas.' },
  { code: 'Z-06', name: 'Plonge', text: 'Le sale suit son propre circuit, isolé, jusqu’à la sortie. La boucle est bouclée sans retour en arrière.' },
];

export const missions = [
  {
    n: '01',
    short: 'Programme',
    title: 'Comprendre vos usages',
    text: 'Volumes, carte, équipes, contraintes du lieu : on part de la façon dont la cuisine va vraiment travailler pour définir l’équipement juste nécessaire, dans l’enveloppe prévue.',
    points: ['Visite et relevé du site', 'Liste d’équipement dimensionnée', 'Enveloppe budgétaire tenue'],
    zone: 1,
  },
  {
    n: '02',
    short: 'Plans',
    title: 'Dessiner le flux',
    text: 'Implantation, réseaux électriques et fluides : des plans qui gagnent chaque mètre carré et où aucun flux ne revient sur ses pas.',
    points: ['Plans d’implantation', 'Électricité & fluides', 'Marche en avant respectée'],
    zone: -1,
  },
  {
    n: '03',
    short: 'Consultation',
    title: 'Choisir les bons équipementiers',
    text: 'Le cahier des charges fixe les règles du jeu. Les offres sont comparées sur une base commune pour retenir la plus juste, pas la plus bruyante.',
    points: ['Cahier des charges', 'Appel d’offres', 'Analyse comparative'],
    zone: 3,
  },
  {
    n: '04',
    short: 'Réception',
    title: 'Livrer ce qui a été dessiné',
    text: 'Jusqu’à la mise en service, on suit le chantier, on réceptionne le matériel et on vérifie qu’il correspond à ce qui a été commandé.',
    points: ['Suivi de chantier', 'Contrôle de conformité', 'Mise en service'],
    zone: 0,
  },
];

export const principles = [
  { k: 'Hygiène & sécurité', v: 'Les normes sont écrites dans le cahier des charges dès le premier jour, pas ajoutées à la fin.' },
  { k: 'Budget tenu', v: 'L’équipement juste nécessaire, choisi pour durer, dans l’enveloppe annoncée.' },
  { k: 'Espace optimisé', v: 'Chaque plan cherche la circulation la plus courte et l’implantation la plus juste.' },
  { k: 'Marche en avant', v: 'Du brut au fini, du propre au sale : les flux avancent et ne se croisent jamais.' },
  { k: 'Conformité', v: 'Le suivi continue jusqu’à la réception du matériel et la vérification des produits livrés.' },
];

export const process = [
  { t: 'Premier échange', d: 'Vous présentez votre projet, votre lieu et vos contraintes.' },
  { t: 'Besoins & budget', d: 'Définition de l’équipement nécessaire dans l’enveloppe prévue.' },
  { t: 'Plans d’aménagement', d: 'Implantation optimisée, marche en avant respectée.' },
  { t: 'Cahier des charges', d: 'Rédaction et consultation des équipementiers.' },
  { t: 'Choix des offres', d: 'Comparaison sur une base commune et sélection.' },
  { t: 'Réception', d: 'Suivi de la livraison et contrôle de conformité du matériel.' },
];

export const fields = [
  {
    id: 'cuisine',
    title: 'Cuisines professionnelles',
    text: 'Hôtels, restaurants, cliniques, écoles, laboratoires, restauration collective : de la réception des marchandises jusqu’au service.',
    tags: ['Réception', 'Stockage', 'Préparation', 'Cuisson', 'Service', 'Plonge'],
  },
  {
    id: 'buanderie',
    title: 'Buanderies professionnelles',
    text: 'Le linge suit lui aussi la marche en avant : du sale au propre, collecte, lavage, séchage, repassage et distribution, sans jamais se croiser.',
    tags: ['Collecte', 'Tri', 'Lavage', 'Séchage', 'Repassage', 'Distribution'],
  },
];

/** Line-art icon per sector, used by the "Pour qui" list. Keys match `icons` in pages/parts.ts. */
export const sectorDetails: { name: string; icon: string; note: string; text: string }[] = [
  { name: 'Hôtellerie', icon: 'combi', note: 'Cuisines & buanderie', text: 'Petits-déjeuners, banquets et linge : plusieurs flux à faire cohabiter.' },
  { name: 'Restaurants', icon: 'range', note: 'Restauration commerciale', text: 'Une ligne chaude taillée pour la carte et le rythme du coup de feu.' },
  { name: 'Cliniques', icon: 'tray', note: 'Établissements de santé', text: 'Régimes, traçabilité et hygiène renforcée.' },
  { name: 'Écoles', icon: 'pot', note: 'Établissements éducatifs', text: 'De grands volumes servis en peu de temps, dans les règles.' },
  { name: 'Laboratoires', icon: 'mixer', note: 'Pâtisserie & boulangerie', text: 'Froid, fournil et plans de travail pensés pour la précision.' },
  { name: 'Collectivités', icon: 'cup', note: 'Restauration collective', text: 'Production centrale, liaison froide ou chaude, distribution.' },
];

export const copy = {
  nav: { home: 'Accueil', about: 'À propos', services: 'Services', contact: 'Contact', menu: 'Menu', close: 'Fermer' },
  common: {
    next: 'Suivant',
    discover: 'Découvrir',
    write: 'Écrire',
    call: 'Appeler',
    rights: 'Concept KOYOTEC',
    tagline: 'Bureau d’études — cuisines & buanderies professionnelles',
    scroll: 'Défiler',
  },
  home: {
    eyebrow: 'Bureau d’études · Tunis',
    title: ['Des cuisines', 'professionnelles', '*pensées au millimètre.*'],
    lead: 'Ligne Inox dessine des cuisines et des buanderies professionnelles où chaque geste a sa place : de la réception des marchandises jusqu’au service, aucun flux ne revient en arrière.',
    flowEyebrow: 'Le principe',
    flowTitle: 'La marche *en avant.*',
    flowLead: 'Du produit brut au plat servi, du propre au sale : chaque flux avance et ne revient jamais sur ses pas. C’est la règle d’hygiène qui guide chacun de nos plans.',
    missionEyebrow: 'Notre méthode',
    missionTitle: 'Quatre étapes, *un seul interlocuteur.*',
    fieldsEyebrow: 'Deux métiers',
    fieldsTitle: 'Cuisine & *buanderie.*',
    ctaTitle: ['Un projet de cuisine', '*ou de buanderie ?*'],
    ctaLabel: 'Parlons-en',
  },
  about: {
    eyebrow: 'À propos',
    title: ['Un bureau d’études.', '*Une obsession : le flux.*'],
    lead: 'Ligne Inox conçoit l’équipement et l’aménagement des cuisines et des buanderies professionnelles, du premier croquis à la mise en service.',
    manifesto:
      'Une cuisine professionnelle se juge au coup de feu, pas sur le papier. Un bon plan ne se voit pas : il se ressent dans chaque geste, chaque circulation, chaque service.',
    manifestoMore:
      'Nous travaillons à partir des usages réels : les volumes, la carte, les équipes, le lieu. Chaque implantation est testée contre le service le plus chargé de la semaine, et chaque mètre carré doit justifier sa place.',
    audienceLabel: 'Nous travaillons avec',
    quote: 'Le plus beau compliment pour un plan, c’est qu’on oublie qu’il a été dessiné.',
    quoteBy: 'Ligne Inox',
    principlesEyebrow: 'Ce qui nous guide',
    principlesTitle: 'Cinq *principes.*',
    specEyebrow: 'Le cahier des charges',
    specTitle: 'Tout commence *par l’écrit.*',
    specLead: 'Le cahier des charges est la colonne vertébrale du projet. Il fixe les besoins, les normes et les critères avant toute consultation.',
    spec: [
      'Objet : équipement & aménagement',
      'Établissement : …',
      'Besoins en équipement : définis',
      'Budget : respecté',
      'Plans : marche en avant',
      'Normes : hygiène & sécurité',
      'Consultation : équipementiers',
      'Réception : conformité vérifiée',
    ],
  },
  services: {
    eyebrow: 'Services',
    title: ['Du besoin', '*à la réception.*'],
    lead: 'Programme, plans, consultation et suivi de chantier : une mission complète pour votre cuisine ou votre buanderie professionnelle.',
    expEyebrow: 'Expertise',
    expTitle: 'Le détail technique, *au service du geste.*',
    expLead: 'Chaque étude part des contraintes réelles d’exploitation, pour que l’espace dessiné soit celui qui fonctionne le jour de l’ouverture.',
    planCaption: 'Plan type — cuisine en marche en avant',
    forEyebrow: 'Pour qui',
    forTitle: 'Chaque établissement, *son plan.*',
    processEyebrow: 'Déroulé',
    processTitle: 'Le projet, *étape par étape.*',
  },
  contactPage: {
    eyebrow: 'Contact',
    title: ['Parlons de', 'votre *projet.*'],
    lead: 'Pour un renseignement ou un rendez-vous, écrivez-nous ou appelez directement. Chaque projet commence par un échange.',
    formTitle: 'Décrivez votre projet',
    labels: {
      name: 'Nom & prénom',
      company: 'Établissement',
      phone: 'Téléphone',
      email: 'E-mail',
      type: 'Type d’établissement',
      project: 'Votre projet',
      message: 'Message',
    },
    projectTypes: ['Cuisine', 'Buanderie', 'Les deux'],
    placeholder: 'Surface, nombre de couverts, calendrier…',
    send: 'Envoyer',
    sending: 'Envoi…',
    sent: 'Concept KOYOTEC : ce formulaire est une démonstration, aucun message n’a été envoyé.',
    invalid: 'Merci de compléter les champs requis.',
    required: 'Requis',
    copied: 'Adresse copiée',
    copy: 'Copier',
  },
};

/** `*text*` → `<em>text</em>` after escaping. */
export function rich(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!).replace(/\*(.+?)\*/g, '<em>$1</em>');
}
