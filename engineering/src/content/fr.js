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
      systems: "Ce que nous construisons — Koyotec Engineering",
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
    { route: "/systems", label: "Systèmes" },
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
    careers: "Carrières",
    careersHref: "/carrieres",
    switchLabel: "EN",
    switchName: "English",
  },
  // labels shown during page transitions, by route
  transition: {
    "/": "Accueil",
    "/expertise": "Expertise",
    "/systems": "Systèmes",
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

  systems: {
    header: {
      title: "Ce que nous",
      subtitle: "construisons",
      description: "Cinq projets types, de l’idée à la mise en production. Faites défiler : chaque schéma se construit sous vos yeux.",
    },
    intro: {
      kicker: ["Projets types", "Expliqués simplement"],
      title: "Cinq systèmes que nous livrons, du problème à la solution.",
      text: "Pas de jargon : pour chaque domaine, un cas concret, ce qui change pour vous, et comment nous le construisons étape par étape.",
      disclaimer: "Projets types : des démonstrations construites à partir de besoins que nous rencontrons souvent. Les noms sont fictifs et les chiffres indiquent des objectifs habituels, pas des résultats garantis.",
    },
    labels: {
      forWho: "Pour qui",
      problem: "Le problème",
      build: "Ce que nous construisons",
      outcomes: "Concrètement, pour vous",
      stack: "Technologies",
      timeline: "Délai typique",
      cta: "Un besoin similaire ? Parlons-en",
      project: "Projet type",
    },
    chapters: [
      {
        id: "ia",
        discipline: "IA",
        code: "Atlas",
        title: "Un assistant qui connaît tous vos documents",
        forWho: "Une entreprise de 200 personnes dont les procédures, contrats et notes internes dorment dans des milliers de fichiers.",
        problem: "Trouver la bonne information prend des heures, et les nouveaux arrivants posent toujours les mêmes questions.",
        steps: [
          ["Vos documents", "PDF, Word, e-mails, wiki : nous les rassemblons sans les sortir de votre infrastructure."],
          ["Indexés par le sens", "Chaque passage devient un point dans un espace où les idées proches se regroupent."],
          ["Une question, en langage courant", "Vos équipes posent leur question comme à un collègue."],
          ["Les bons passages", "L’assistant retrouve les extraits les plus pertinents, pas seulement des mots-clés."],
          ["Une réponse sourcée", "La réponse cite ses sources : on peut toujours vérifier."],
        ],
        outcomes: [
          ["Quelques secondes", "au lieu de longues recherches dans les dossiers partagés"],
          ["Sources citées", "à chaque réponse, pour garder la confiance"],
          ["Vos données restent chez vous", "hébergement sur vos serveurs ou en Europe"],
        ],
        stack: ["Python", "LangChain", "PostgreSQL + pgvector", "LLM open source ou API", "Docker"],
        timeline: "6 à 10 semaines",
        visual: {
          files: ["contrats.pdf", "rh_2025.docx", "procedures.pdf", "factures.xlsx", "emails.mbox", "wiki.html"],
          clusters: ["Contrats", "RH", "Procédures", "Factures", "E-mails", "Wiki"],
          question: "Combien de jours de congé après une naissance ?",
          answer: "Le congé de naissance est de 7 jours ouvrés, à poser dans les 30 jours suivant la naissance.",
          sources: ["Règlement RH 2025, art. 14", "Procédure congés v3, p. 2"],
          you: "Vous",
          assistant: "Atlas",
        },
      },
      {
        id: "devops",
        discipline: "DevOps",
        code: "Relay",
        title: "Du code à la production, sans coupure ni stress",
        forWho: "Une équipe produit qui met en ligne à la main, un vendredi soir, en croisant les doigts.",
        problem: "Chaque mise en production est lente, risquée, et dépend d’une seule personne.",
        steps: [
          ["Le code est poussé", "Chaque modification déclenche la chaîne, sans intervention humaine."],
          ["Construit, testé, analysé", "Compilation, tests automatiques et analyse de sécurité, à chaque fois."],
          ["Empaqueté une fois pour toutes", "L’application devient une image conteneur versionnée, identique partout."],
          ["Déployé sans coupure", "Kubernetes remplace les anciennes versions une à une : vos utilisateurs ne voient rien."],
          ["Surveillé en continu", "Métriques et alertes en temps réel, retour arrière automatique si besoin."],
        ],
        outcomes: [
          ["En minutes", "des mises en production plusieurs fois par jour"],
          ["Zéro coupure", "pendant les déploiements"],
          ["Retour arrière", "en un clic, ou automatique"],
        ],
        stack: ["GitHub Actions", "GitLab CI", "Docker", "Kubernetes", "Terraform", "Prometheus", "Grafana"],
        timeline: "4 à 8 semaines",
        visual: {
          nodes: ["Commit", "Build", "Tests", "Sécurité", "Image", "Registre", "Staging", "Production", "Supervision"],
          logs: [
            "$ git push origin main",
            "pipeline #1284 démarré",
            "build      ✓  38 s",
            "tests      ✓  214 réussis",
            "sécurité   ✓  0 faille critique",
            "image      ✓  app:1.8.2",
            "registre   ✓  image publiée",
            "staging    ✓  tests de fumée OK",
            "production ✓  3/3 pods à jour, 0 coupure",
            "supervision ✓ latence p95 120 ms",
          ],
          terminal: "pipeline",
          pods: "pods",
        },
      },
      {
        id: "cloud",
        discipline: "Cloud",
        code: "Harbor",
        title: "Une infrastructure qui tient la charge",
        forWho: "Une boutique en ligne hébergée sur un seul serveur, qui tombe à chaque promotion.",
        problem: "Au moindre pic de visites, le site ralentit puis s’arrête, et chaque minute coûte des ventes.",
        steps: [
          ["Aujourd’hui : un seul serveur", "Tout repose sur une machine : si elle tombe, tout s’arrête."],
          ["Décrite en code", "Toute l’infrastructure est écrite en Terraform : reproductible, versionnée, vérifiable."],
          ["Répartie sur trois zones", "Serveurs et base de données sont dupliqués dans des datacenters distincts."],
          ["Elle s’adapte au trafic", "Pendant un pic, de nouveaux serveurs démarrent seuls, puis s’éteignent."],
          ["Sauvegardée, coûts maîtrisés", "Sauvegardes automatiques et budget suivi chaque mois."],
        ],
        outcomes: [
          ["99,9 %", "de disponibilité visée"],
          ["Automatique", "la montée en charge pendant les pics"],
          ["Facture suivie", "et optimisée chaque mois"],
        ],
        stack: ["AWS", "Azure", "Google Cloud", "Terraform", "Kubernetes", "PostgreSQL managé", "CDN"],
        timeline: "6 à 12 semaines",
        visual: {
          monolith: "serveur unique",
          zones: ["zone A", "zone B", "zone C"],
          lb: "répartiteur",
          cdn: "CDN",
          db: "base de données",
          vault: "sauvegardes",
          users: "visiteurs",
          load: "Charge",
          servers: "Serveurs",
          cost: "Budget mensuel",
          overload: "surcharge",
        },
      },
      {
        id: "security",
        discipline: "Cybersécurité",
        code: "Bastion",
        title: "Trouver les failles avant les pirates",
        forWho: "Une PME qui gère des données clients sans savoir où sont ses points faibles.",
        problem: "Une seule faille peut suffire : vol de données, rançongiciel, plusieurs jours d’arrêt.",
        steps: [
          ["On cherche les failles", "Nous testons votre système comme le ferait un attaquant, avec votre accord."],
          ["Un rapport clair", "Chaque faille classée par gravité, expliquée simplement, avec sa correction."],
          ["On ferme les portes", "Mises à jour, accès, mots de passe, pare-feu : la surface d’attaque se réduit."],
          ["Surveillance 24 h/24", "Les tentatives d’intrusion sont détectées et bloquées en temps réel."],
          ["Vos équipes formées", "Sensibilisation au phishing : le premier rempart, ce sont vos collaborateurs."],
        ],
        outcomes: [
          ["Priorités claires", "les failles critiques corrigées en premier"],
          ["Alertes en temps réel", "au lieu de découvrir l’attaque des semaines plus tard"],
          ["Conformité facilitée", "ISO 27001, RGPD, loi tunisienne sur les données"],
        ],
        stack: ["OWASP ZAP", "Nmap", "Burp Suite", "Wazuh", "CrowdSec", "MFA"],
        timeline: "Audit en 2 à 3 semaines, puis suivi mensuel",
        visual: {
          found: "Failles trouvées",
          report: [["Critique", 2], ["Élevée", 4], ["Moyenne", 6]],
          fixed: "Corrigées",
          blocked: "Bloqué",
          attacks: ["force brute SSH", "injection SQL", "scan de ports", "phishing", "XSS"],
          score: "Score de sécurité",
        },
      },
      {
        id: "data",
        discipline: "Data & BI",
        code: "Prism",
        title: "Toutes vos données, un seul tableau de bord",
        forWho: "Un distributeur dont les chiffres vivent dans l’ERP, trois fichiers Excel et le CRM.",
        problem: "Chaque lundi, une journée entière passe à copier des exports pour obtenir des chiffres déjà dépassés.",
        steps: [
          ["Des données éparpillées", "Ventes dans l’ERP, stocks dans Excel, clients dans le CRM : rien ne se parle."],
          ["Collectées chaque nuit", "Des flux automatiques extraient, nettoient et rapprochent les données."],
          ["Un entrepôt unique", "Une seule source de vérité, historisée et sécurisée."],
          ["Des tableaux de bord vivants", "Chiffre d’affaires, marges, stocks : à jour chaque matin, sur ordinateur ou mobile."],
          ["Des alertes utiles", "L’information arrive avant que le problème ne coûte."],
        ],
        outcomes: [
          ["Fini les exports", "Excel copiés à la main"],
          ["À jour chaque matin", "sans intervention"],
          ["Des décisions", "prises sur des chiffres fiables"],
        ],
        stack: ["Python", "Airbyte", "dbt", "PostgreSQL", "BigQuery", "Power BI", "Metabase"],
        timeline: "6 à 10 semaines",
        visual: {
          sources: ["ERP", "Excel", "CRM", "Boutique"],
          warehouse: "Entrepôt",
          kpis: [["Chiffre d’affaires", "1,24 M DT"], ["Marge", "31,8 %"], ["Commandes", "8 412"]],
          chart: "Ventes par mois",
          regions: ["Tunis", "Sfax", "Sousse", "Nabeul"],
          alert: "Stock bas à Sfax : 12 unités",
          dashboard: "Tableau de bord",
        },
      },
    ],
  },

  positions: {
    meta: "Candidatures spontanées /",
    title: ["Nous", "rejoindre"],
    // each row opens the application form of the main site, preset for this role
    careers: "/carrieres",
    roles: [
      { title: "Ingénieur DevOps", tag: "DevOps", location: "Tunis", role: "devops" },
      { title: "Ingénieur cloud", tag: "Cloud", location: "Hybride", role: "cloud" },
      { title: "Ingénieur IA / ML", tag: "IA", location: "Tunis", role: "ai" },
      { title: "Data engineer", tag: "Data", location: "Remote", role: "data" },
      { title: "Analyste cybersécurité", tag: "Sécurité", location: "Tunis", role: "security" },
      { title: "Stage de fin d’études", tag: "Tous pôles", location: "Tunis", contract: "stage" },
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
