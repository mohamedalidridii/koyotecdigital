// English copy: same keys as fr.js.
const en = {
  lang: "en",
  meta: {
    title: "Koyotec Engineering — AI, Cloud, DevOps, Cybersecurity & BI in Tunis",
    description:
      "Koyotec Engineering designs, ships and secures your systems: artificial intelligence, cloud, DevOps, cybersecurity and business intelligence. Based in Tunis.",
    pages: {
      expertise: "Expertise — Koyotec Engineering",
      work: "Blueprints — Koyotec Engineering",
      studio: "The studio — Koyotec Engineering",
      engagements: "Engagements — Koyotec Engineering",
      contact: "Contact — Koyotec Engineering",
    },
  },

  brand: { name: "Koyotec", line: ["Engineering", "Tunis"] },
  nav: [
    { route: "/", label: "Home" },
    { route: "/expertise", label: "Expertise" },
    { route: "/work", label: "Blueprints" },
    { route: "/studio", label: "The studio" },
    { route: "/engagements", label: "Engagements" },
  ],
  navContact: { title: "Let’s talk", code: "Contact" },
  menu: {
    open: "Open menu",
    close: "Close menu",
    home: "Koyotec Engineering — home",
    back: "← koyotec.digital",
    backHref: "/en/",
    switchLabel: "FR",
    switchName: "Français",
  },
  transition: {
    "/": "Home",
    "/expertise": "Expertise",
    "/work": "Blueprints",
    "/studio": "The studio",
    "/engagements": "Engagements",
    "/contact": "Let’s talk",
  },
  preloader: "Loading",
  scrollToContent: "Scroll to content",

  home: {
    header: ["AI · Cloud · DevOps · Security · Data", "Tunis, Tunisia"],
    title: "Systems that hold.",
    ctaPrimary: "Start a project",
    ctaSecondary: "Our expertise",
    aboutHeader: ["Who we are", "The technical arm"],
    about:
      "Koyotec Engineering is the technical arm of Koyotec. We design, ship and secure the systems a business runs on: AI models, cloud infrastructure, delivery pipelines, data and dashboards.",
  },

  focus: [
    {
      title: "Intelligence",
      copy: "Applied AI and business intelligence: models and dashboards wired to your real data, not to a demo.",
    },
    {
      title: "Infrastructure",
      copy: "Cloud and DevOps: an automated, observable, documented platform that deploys without ceremony.",
    },
    {
      title: "Security",
      copy: "Cybersecurity: audits, hardening and access control, so your systems stay yours.",
    },
  ],

  marquee:
    "Artificial intelligence, cloud, DevOps, cybersecurity and data, from the first audit to production.",

  process: {
    steps: ["We audit what you have.", "We design the architecture.", "We build and test."],
    cta: "We ship it, and we stay.",
    headline: "How a need becomes a system in production, in four steps.",
    footer: ["Audit to run", "The Koyotec method"],
  },

  statement: {
    topLeft: "A reliable system goes unnoticed.",
    bottomRight: "That is exactly what we build.",
  },

  pages: {
    expertise: {
      title: "Our",
      subtitle: "expertise",
      description: "Five disciplines, one team, and systems built to last.",
    },
    studio: {
      title: "The",
      subtitle: "studio",
      description: "How we work, what matters to us, and who we are looking for.",
    },
    engagements: {
      title: "Ways",
      subtitle: "to engage",
      description: "An audit, a project or ongoing support: you pick the format.",
    },
    contact: {
      title: "Let’s build",
      subtitle: "together",
      description: "A question, a project, a system that needs fixing: write to us.",
    },
  },

  researchStatement: {
    header: ["Reliability first", "By the numbers"],
    statement:
      "The hard part is not making a system work. It is making sure it still works six months later. We build for that moment.",
    copy: "Our work spans five disciplines that talk to each other: AI, cloud, DevOps, cybersecurity and BI. One partner, from the first audit to day-to-day operations.",
    stats: [
      { label: "Disciplines", value: "05" },
      { label: "Method steps", value: "04" },
      { label: "Public clouds", value: "03" },
      { label: "Working languages", value: "02" },
    ],
  },

  areas: [
    {
      title: "Artificial intelligence",
      label: "AI",
      description:
        "LLM assistants and RAG over your documents, process automation, predictive models, and MLOps to keep them reliable in production.",
    },
    {
      title: "Cloud",
      label: "Cloud",
      description:
        "Migration to AWS, Azure or GCP, high-availability architectures and cost optimisation, without vendor lock-in.",
    },
    {
      title: "DevOps",
      label: "DevOps",
      description:
        "CI/CD pipelines, containers and Kubernetes, infrastructure as code with Terraform, and monitoring that pages the right people.",
    },
    {
      title: "Cybersecurity",
      label: "Security",
      description:
        "Audits and penetration tests, server and cloud hardening, identity management and ISO 27001 readiness.",
    },
    {
      title: "Business intelligence",
      label: "Data",
      description:
        "Data warehouses, ETL pipelines and Power BI or Metabase dashboards your teams actually open.",
    },
  ],

  outcomes: {
    header: ["What you keep", "Deliverables, not promises"],
    title: ["What", "stays"],
    copy: "A project that ends at a demo helps no one. Every engagement leaves something concrete behind, something your team understands and can build on.",
    items: [
      "Documented infrastructure that you own",
      "Automated, reversible deployments",
      "AI models evaluated on your own data",
      "Monitoring that alerts before your customers do",
      "Access and secrets under control",
      "Dashboards your teams actually open",
      "A prioritised, actionable security report",
      "A full handover to your teams",
    ],
  },

  work: [
    { title: "Internal RAG assistant", category: "AI" },
    { title: "Zero-downtime cloud migration", category: "Cloud" },
    { title: "CI/CD & Kubernetes pipeline", category: "DevOps" },
    { title: "Audit & hardening", category: "Security" },
    { title: "Decision dashboard", category: "BI" },
  ],
  workYear: "2026",
  workLabels: { header: "Solution blueprints", footer: ["Blueprint index", "Scroll through"] },

  firmIntro: {
    short: "A small team of senior engineers. We build the systems.",
    long: "A small team of senior engineers. We build the systems, document them, and hand them to your teams in working order.",
  },

  positions: {
    meta: "Open applications /",
    title: ["Join", "us"],
    email: "mailto:contact@koyotec.digital?subject=Application%20Koyotec%20Engineering",
    roles: [
      { title: "DevOps engineer", tag: "DevOps", location: "Tunis" },
      { title: "Cloud engineer", tag: "Cloud", location: "Hybrid" },
      { title: "AI / ML engineer", tag: "AI", location: "Tunis" },
      { title: "Data engineer", tag: "Data", location: "Remote" },
      { title: "Security analyst", tag: "Security", location: "Tunis" },
      { title: "Final-year internship", tag: "All teams", location: "Tunis" },
    ],
  },

  studioStatement: {
    topLeft: "Good systems are boring to watch.",
    bottomRight: "They run, they warn you, and they let you fix them.",
  },

  engagements: [
    {
      title: "Audit",
      copy: "Two to three weeks to assess your infrastructure, security or data, ending with a prioritised action plan.",
    },
    {
      title: "Project",
      copy: "A clear scope, timeline and deliverables: a migration, a platform, an AI assistant or a data warehouse.",
    },
    {
      title: "Run",
      copy: "Monthly support: monitoring, maintenance, security updates and improvements, with a dedicated contact.",
    },
  ],

  partners: {
    header: ["Our toolkit", "No dogma"],
    copy: "Proven tools, chosen for your context rather than our comfort. These are the ones we use every day.",
    footer: ["Technologies", "Chosen case by case"],
  },

  contact: {
    title: "Write to us",
    copy: "Describe your context, even in two lines. We come back with precise questions, then a proposal.",
    labels: { address: "Address", comms: "Contact", form: "Form", social: "Social" },
    address: ["Ennasr", "Tunis", "Tunisia"],
    form: { text: "Quote form", href: "https://www.koyotec.digital/en/contact" },
    formNote: "Reply within 24 business hours",
  },

  faq: {
    header: ["FAQ / 01", "Common questions"],
    title: "Your questions answered",
    items: [
      {
        question: "What kind of projects do you take on?",
        answer: [
          "Applied AI, cloud, DevOps, cybersecurity and business intelligence.",
          "That ranges from an AI assistant wired to your documents to a full infrastructure migration, a security audit or a data warehouse.",
        ],
      },
      {
        question: "How do you price an engagement?",
        answer: [
          "After a free first call, we propose a scope and a fixed price for audits and projects.",
          "Ongoing support (run) is billed monthly, with a set number of hours.",
        ],
      },
      {
        question: "Which cloud providers do you work with?",
        answer: [
          "AWS, Microsoft Azure and Google Cloud, as well as local hosting providers and on-premise servers.",
          "We recommend what fits your budget and constraints, not a particular vendor.",
        ],
      },
      {
        question: "How do you protect our data?",
        answer: [
          "We sign an NDA before any access, work on least privilege, and log every access we are given.",
          "Your data stays in your environment whenever possible.",
        ],
      },
      {
        question: "What happens after delivery?",
        answer: [
          "Every project ends with full documentation and a handover to your teams.",
          "If you want, we keep monitoring and improving the system under a run contract.",
        ],
      },
    ],
  },

  footer: {
    copy: "The technical arm of Koyotec: artificial intelligence, cloud, DevOps, cybersecurity and business intelligence, built to hold long after launch.",
    words: ["Koyotec", "Eng."],
  },
};

export default en;
