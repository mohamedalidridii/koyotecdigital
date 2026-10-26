// Every piece of copy for the French site. en.js mirrors these keys exactly.
// Contact details follow content/site.json of the main site.
const fr = {
  lang: "fr",
  meta: {
    title: "Koyotec Engineering — IA, Cloud, DevOps, Cybersécurité & BI à Tunis",
    description:
      "Koyotec Engineering conçoit, déploie et sécurise vos systèmes : intelligence artificielle, cloud, DevOps, cybersécurité et business intelligence. Basés à Tunis.",
    pages: {
      expertise: "Expertise — Koyotec Engineering",
      work: "Blueprints — Koyotec Engineering",
      studio: "Le studio — Koyotec Engineering",
      engagements: "Engagements — Koyotec Engineering",
      contact: "Contact — Koyotec Engineering",
    },
  },

  brand: { name: "Koyotec", line: ["Engineering", "Tunis"] },
  nav: [
    { route: "/", label: "Accueil" },
    { route: "/expertise", label: "Expertise" },
    { route: "/work", label: "Blueprints" },
    { route: "/studio", label: "Le studio" },
    { route: "/engagements", label: "Engagements" },
  ],
  navContact: { title: "Parlons-en", code: "Contact" },
  menu: {
    open: "Ouvrir le menu",
    close: "Fermer le menu",
    home: "Koyotec Engineering — accueil",
    back: "← koyotec.digital",
    backHref: "/",
    switchLabel: "EN",
    switchName: "English",
  },
  // labels shown during page transitions, by route
  transition: {
    "/": "Accueil",
    "/expertise": "Expertise",
    "/work": "Blueprints",
    "/studio": "Le studio",
    "/engagements": "Engagements",
    "/contact": "Parlons-en",
  },
  preloader: "Chargement",
  scrollToContent: "Aller au contenu",

  home: {
    header: ["IA · Cloud · DevOps · Sécurité · Data", "Tunis, Tunisie"],
    title: "Des systèmes qui tiennent.",
    ctaPrimary: "Démarrer un projet",
    ctaSecondary: "Notre expertise",
    aboutHeader: ["Qui nous sommes", "Le pôle technique"],
    about:
      "Koyotec Engineering est le pôle technique de Koyotec. Nous concevons, déployons et sécurisons les systèmes qui font tourner une entreprise : modèles d’IA, infrastructures cloud, chaînes de livraison, données et tableaux de bord.",
  },

  focus: [
    {
      title: "Intelligence",
      copy: "IA appliquée et business intelligence : des modèles et des tableaux de bord branchés sur vos vraies données, pas sur une démo.",
    },
    {
      title: "Infrastructure",
      copy: "Cloud et DevOps : une plateforme automatisée, observable et documentée, qui se déploie sans cérémonie.",
    },
    {
      title: "Sécurité",
      copy: "Cybersécurité : audits, durcissement et contrôle d’accès, pour que vos systèmes restent les vôtres.",
    },
  ],

  marquee:
    "Intelligence artificielle, cloud, DevOps, cybersécurité et données, de l’audit à la production.",

  process: {
    steps: ["On audite l’existant.", "On dessine l’architecture.", "On construit et on teste."],
    cta: "On met en production, et on reste.",
    headline: "Comment un besoin devient un système en production, en quatre étapes.",
    footer: ["De l’audit au run", "Méthode Koyotec"],
  },

  statement: {
    topLeft: "Un système fiable ne se remarque pas.",
    bottomRight: "C’est exactement ce que nous construisons.",
  },

  pages: {
    expertise: {
      title: "Notre",
      subtitle: "expertise",
      description: "Cinq disciplines, une seule équipe, et des systèmes pensés pour durer.",
    },
    studio: {
      title: "Le",
      subtitle: "studio",
      description: "Comment nous travaillons, ce qui compte pour nous, et qui nous cherchons.",
    },
    engagements: {
      title: "Modes",
      subtitle: "d’engagement",
      description: "Un audit, un projet ou un accompagnement continu : vous choisissez le format.",
    },
    contact: {
      title: "Construisons",
      subtitle: "ensemble",
      description: "Une question, un projet, un système à remettre d’aplomb : écrivez-nous.",
    },
  },

  researchStatement: {
    header: ["La fiabilité d’abord", "En chiffres"],
    statement:
      "Le plus dur n’est pas de faire marcher un système, c’est qu’il marche encore dans six mois. Nous construisons pour ce moment-là.",
    copy: "Notre travail couvre cinq disciplines qui se parlent : l’IA, le cloud, le DevOps, la cybersécurité et la BI. Un seul interlocuteur, de l’audit au run.",
    stats: [
      { label: "Disciplines", value: "05" },
      { label: "Étapes de méthode", value: "04" },
      { label: "Clouds publics", value: "03" },
      { label: "Langues de travail", value: "02" },
    ],
  },

  areas: [
    {
      title: "Intelligence artificielle",
      label: "IA",
      description:
        "Assistants LLM et RAG sur vos documents, automatisation de traitements, modèles de prédiction et MLOps pour les garder fiables en production.",
    },
    {
      title: "Cloud",
      label: "Cloud",
      description:
        "Migration vers AWS, Azure ou GCP, architectures haute disponibilité et optimisation des coûts, sans enfermement chez un fournisseur.",
    },
    {
      title: "DevOps",
      label: "DevOps",
      description:
        "Pipelines CI/CD, conteneurs et Kubernetes, infrastructure as code avec Terraform, supervision et alertes qui réveillent les bonnes personnes.",
    },
    {
      title: "Cybersécurité",
      label: "Sécurité",
      description:
        "Audits et tests d’intrusion, durcissement des serveurs et du cloud, gestion des identités et préparation à l’ISO 27001.",
    },
    {
      title: "Business intelligence",
      label: "Data",
      description:
        "Entrepôt de données, pipelines ETL et tableaux de bord Power BI ou Metabase que vos équipes ouvrent vraiment.",
    },
  ],

  outcomes: {
    header: ["Ce que vous gardez", "Des livrables, pas des promesses"],
    title: ["Ce qui", "reste"],
    copy: "Un projet qui s’arrête à une démo ne sert à personne. Chaque mission laisse derrière elle quelque chose de concret, que votre équipe comprend et peut faire évoluer.",
    items: [
      "Une infrastructure documentée qui vous appartient",
      "Des déploiements automatisés et réversibles",
      "Des modèles d’IA évalués sur vos propres données",
      "Une supervision qui alerte avant vos clients",
      "Des accès et des secrets sous contrôle",
      "Des tableaux de bord que vos équipes ouvrent",
      "Un rapport de sécurité priorisé et actionnable",
      "Une passation complète à vos équipes",
    ],
  },

  work: [
    { title: "Assistant RAG interne", category: "IA" },
    { title: "Migration cloud sans coupure", category: "Cloud" },
    { title: "Pipeline CI/CD & Kubernetes", category: "DevOps" },
    { title: "Audit & durcissement", category: "Sécurité" },
    { title: "Tableau de bord décisionnel", category: "BI" },
  ],
  workYear: "2026",
  workLabels: { header: "Solutions types", footer: ["Index des blueprints", "Faites défiler"] },

  firmIntro: {
    short: "Une petite équipe d’ingénieurs seniors. Nous construisons les systèmes.",
    long: "Une petite équipe d’ingénieurs seniors. Nous construisons les systèmes, nous les documentons, et nous les confions à vos équipes en état de marche.",
  },

  positions: {
    meta: "Candidatures spontanées /",
    title: ["Nous", "rejoindre"],
    email: "mailto:contact@koyotec.digital?subject=Candidature%20Koyotec%20Engineering",
    roles: [
      { title: "Ingénieur DevOps", tag: "DevOps", location: "Tunis" },
      { title: "Ingénieur cloud", tag: "Cloud", location: "Hybride" },
      { title: "Ingénieur IA / ML", tag: "IA", location: "Tunis" },
      { title: "Data engineer", tag: "Data", location: "Remote" },
      { title: "Analyste cybersécurité", tag: "Sécurité", location: "Tunis" },
      { title: "Stage de fin d’études", tag: "Tous pôles", location: "Tunis" },
    ],
  },

  studioStatement: {
    topLeft: "Les bons systèmes sont ennuyeux à regarder.",
    bottomRight: "Ils tournent, ils préviennent, et ils se laissent réparer.",
  },

  engagements: [
    {
      title: "Audit",
      copy: "Deux à trois semaines pour faire l’état des lieux de votre infrastructure, de votre sécurité ou de vos données, avec un plan d’action priorisé.",
    },
    {
      title: "Projet",
      copy: "Un périmètre, un calendrier et des livrables clairs : une migration, une plateforme, un assistant IA ou un entrepôt de données.",
    },
    {
      title: "Run",
      copy: "Un accompagnement mensuel : supervision, maintenance, mises à jour de sécurité et évolutions, avec un interlocuteur dédié.",
    },
  ],

  partners: {
    header: ["Notre outillage", "Sans dogme"],
    copy: "Des outils éprouvés, choisis pour votre contexte et non pour notre confort. Voici ceux que nous utilisons au quotidien.",
    footer: ["Technologies", "Choisies au cas par cas"],
  },

  contact: {
    title: "Écrivez-nous",
    copy: "Décrivez votre contexte, même en deux lignes. Nous revenons vers vous avec des questions précises, puis une proposition.",
    labels: { address: "Adresse", comms: "Contact", form: "Formulaire", social: "Réseaux" },
    address: ["Ennasr", "Tunis", "Tunisie"],
    form: { text: "Formulaire de devis", href: "https://www.koyotec.digital/contact" },
    formNote: "Réponse sous 24 h ouvrées",
  },

  faq: {
    header: ["FAQ / 01", "Questions fréquentes"],
    title: "Vos questions, nos réponses",
    items: [
      {
        question: "Sur quels types de projets intervenez-vous ?",
        answer: [
          "IA appliquée, cloud, DevOps, cybersécurité et business intelligence.",
          "Cela va d’un assistant IA branché sur vos documents à la migration complète d’une infrastructure, en passant par un audit de sécurité ou un entrepôt de données.",
        ],
      },
      {
        question: "Comment chiffrez-vous une mission ?",
        answer: [
          "Après un premier échange gratuit, nous proposons un périmètre et un prix fixe pour les audits et les projets.",
          "L’accompagnement continu (run) est facturé au mois, avec un volume d’heures défini.",
        ],
      },
      {
        question: "Avec quels fournisseurs cloud travaillez-vous ?",
        answer: [
          "AWS, Microsoft Azure et Google Cloud, ainsi que les hébergeurs locaux et les serveurs on-premise.",
          "Nous recommandons ce qui convient à votre budget et à vos contraintes, pas un fournisseur en particulier.",
        ],
      },
      {
        question: "Comment protégez-vous nos données ?",
        answer: [
          "Nous signons un accord de confidentialité avant tout accès, travaillons avec le principe du moindre privilège et documentons chaque accès.",
          "Vos données restent dans votre environnement autant que possible.",
        ],
      },
      {
        question: "Que se passe-t-il après la livraison ?",
        answer: [
          "Chaque projet se termine par une documentation complète et une passation à vos équipes.",
          "Si vous le souhaitez, nous continuons à superviser et à faire évoluer le système dans le cadre d’un contrat de run.",
        ],
      },
    ],
  },

  footer: {
    copy: "Le pôle technique de Koyotec : intelligence artificielle, cloud, DevOps, cybersécurité et business intelligence, conçus pour tenir longtemps après la mise en ligne.",
    words: ["Koyotec", "Eng."],
  },
};

export default fr;
