// English copy: same keys as fr.js.
const en = {
  lang: "en",
  meta: {
    title: "Koyotec Engineering — AI, Cloud, DevOps, Cybersecurity & BI in Tunis",
    description:
      "Koyotec Engineering designs, ships and secures your systems: artificial intelligence, cloud, DevOps, cybersecurity and business intelligence. Based in Tunis.",
    pages: {
      expertise: "Expertise — Koyotec Engineering",
      systems: "What we build — Koyotec Engineering",
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
    { route: "/systems", label: "Systems" },
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
    careers: "Careers",
    careersHref: "/en/careers",
    switchLabel: "FR",
    switchName: "Français",
  },
  transition: {
    "/": "Home",
    "/expertise": "Expertise",
    "/systems": "Systems",
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

  systems: {
    header: {
      title: "What we",
      subtitle: "build",
      description: "Five typical projects, from the idea to production. Scroll: each diagram builds itself before your eyes.",
    },
    intro: {
      kicker: ["Typical projects", "Explained simply"],
      title: "Five systems we deliver, from the problem to the solution.",
      text: "No jargon: for each field, a concrete case, what changes for you, and how we build it step by step.",
      disclaimer: "Typical projects: demonstrations built from needs we meet often. Names are fictional and figures show usual targets, not guaranteed results.",
    },
    labels: {
      forWho: "For whom",
      problem: "The problem",
      build: "What we build",
      outcomes: "What it means for you",
      stack: "Technologies",
      timeline: "Typical timeline",
      cta: "A similar need? Let’s talk",
      project: "Typical project",
    },
    chapters: [
      {
        id: "ia",
        discipline: "AI",
        code: "Atlas",
        title: "An assistant that knows all your documents",
        forWho: "A 200-person company whose procedures, contracts and internal notes sleep in thousands of files.",
        problem: "Finding the right information takes hours, and newcomers keep asking the same questions.",
        steps: [
          ["Your documents", "PDFs, Word files, emails, wiki: we gather them without taking them out of your infrastructure."],
          ["Indexed by meaning", "Each passage becomes a point in a space where related ideas cluster together."],
          ["A question, in plain words", "Your teams ask their question as they would ask a colleague."],
          ["The right passages", "The assistant finds the most relevant excerpts, not just keywords."],
          ["An answer with sources", "The answer cites its sources: you can always check."],
        ],
        outcomes: [
          ["A few seconds", "instead of long searches through shared folders"],
          ["Sources cited", "in every answer, so trust stays"],
          ["Your data stays yours", "hosted on your servers or in Europe"],
        ],
        stack: ["Python", "LangChain", "PostgreSQL + pgvector", "Open-source LLM or API", "Docker"],
        timeline: "6 to 10 weeks",
        visual: {
          files: ["contracts.pdf", "hr_2025.docx", "procedures.pdf", "invoices.xlsx", "emails.mbox", "wiki.html"],
          clusters: ["Contracts", "HR", "Procedures", "Invoices", "Emails", "Wiki"],
          question: "How many days of leave after a birth?",
          answer: "Birth leave is 7 working days, to be taken within 30 days of the birth.",
          sources: ["HR rules 2025, art. 14", "Leave procedure v3, p. 2"],
          you: "You",
          assistant: "Atlas",
        },
      },
      {
        id: "devops",
        discipline: "DevOps",
        code: "Relay",
        title: "From code to production, no downtime, no stress",
        forWho: "A product team that deploys by hand, on a Friday night, fingers crossed.",
        problem: "Every release is slow, risky, and depends on a single person.",
        steps: [
          ["Code is pushed", "Every change triggers the chain, with no human step."],
          ["Built, tested, scanned", "Compilation, automated tests and security scan, every single time."],
          ["Packaged once and for all", "The app becomes a versioned container image, identical everywhere."],
          ["Deployed with no downtime", "Kubernetes replaces old versions one by one: your users notice nothing."],
          ["Watched continuously", "Real-time metrics and alerts, automatic rollback when needed."],
        ],
        outcomes: [
          ["In minutes", "releases several times a day"],
          ["Zero downtime", "during deployments"],
          ["Rollback", "in one click, or automatic"],
        ],
        stack: ["GitHub Actions", "GitLab CI", "Docker", "Kubernetes", "Terraform", "Prometheus", "Grafana"],
        timeline: "4 to 8 weeks",
        visual: {
          nodes: ["Commit", "Build", "Tests", "Security", "Image", "Registry", "Staging", "Production", "Monitoring"],
          logs: [
            "$ git push origin main",
            "pipeline #1284 started",
            "build      ✓  38 s",
            "tests      ✓  214 passed",
            "security   ✓  0 critical issue",
            "image      ✓  app:1.8.2",
            "registry   ✓  image published",
            "staging    ✓  smoke tests OK",
            "production ✓  3/3 pods updated, 0 downtime",
            "monitoring ✓  p95 latency 120 ms",
          ],
          terminal: "pipeline",
          pods: "pods",
        },
      },
      {
        id: "cloud",
        discipline: "Cloud",
        code: "Harbor",
        title: "An infrastructure that holds the load",
        forWho: "An online shop hosted on a single server that goes down at every sale.",
        problem: "At the slightest traffic peak, the site slows down then stops, and every minute costs sales.",
        steps: [
          ["Today: a single server", "Everything relies on one machine: if it falls, everything stops."],
          ["Described as code", "The whole infrastructure is written in Terraform: reproducible, versioned, reviewable."],
          ["Spread over three zones", "Servers and database are duplicated in separate data centres."],
          ["It follows the traffic", "During a peak, new servers start on their own, then shut down."],
          ["Backed up, costs under control", "Automatic backups and a budget tracked every month."],
        ],
        outcomes: [
          ["99.9%", "target availability"],
          ["Automatic", "scaling during peaks"],
          ["Tracked bill", "optimised every month"],
        ],
        stack: ["AWS", "Azure", "Google Cloud", "Terraform", "Kubernetes", "Managed PostgreSQL", "CDN"],
        timeline: "6 to 12 weeks",
        visual: {
          monolith: "single server",
          zones: ["zone A", "zone B", "zone C"],
          lb: "load balancer",
          cdn: "CDN",
          db: "database",
          vault: "backups",
          users: "visitors",
          load: "Load",
          servers: "Servers",
          cost: "Monthly budget",
          overload: "overload",
        },
      },
      {
        id: "security",
        discipline: "Cybersecurity",
        code: "Bastion",
        title: "Find the flaws before attackers do",
        forWho: "An SME handling customer data without knowing where its weak spots are.",
        problem: "One flaw can be enough: data theft, ransomware, days of downtime.",
        steps: [
          ["We look for the flaws", "We test your system the way an attacker would, with your consent."],
          ["A clear report", "Every flaw ranked by severity, explained simply, with its fix."],
          ["We close the doors", "Updates, access, passwords, firewall: the attack surface shrinks."],
          ["24/7 monitoring", "Intrusion attempts are detected and blocked in real time."],
          ["Your teams trained", "Phishing awareness: your people are the first line of defence."],
        ],
        outcomes: [
          ["Clear priorities", "critical flaws fixed first"],
          ["Real-time alerts", "instead of finding out weeks later"],
          ["Easier compliance", "ISO 27001, GDPR, Tunisian data law"],
        ],
        stack: ["OWASP ZAP", "Nmap", "Burp Suite", "Wazuh", "CrowdSec", "MFA"],
        timeline: "Audit in 2 to 3 weeks, then monthly follow-up",
        visual: {
          found: "Flaws found",
          report: [["Critical", 2], ["High", 4], ["Medium", 6]],
          fixed: "Fixed",
          blocked: "Blocked",
          attacks: ["SSH brute force", "SQL injection", "port scan", "phishing", "XSS"],
          score: "Security score",
        },
      },
      {
        id: "data",
        discipline: "Data & BI",
        code: "Prism",
        title: "All your data, one dashboard",
        forWho: "A distributor whose figures live in the ERP, three Excel files and the CRM.",
        problem: "Every Monday, a whole day goes into copying exports to get figures that are already out of date.",
        steps: [
          ["Scattered data", "Sales in the ERP, stock in Excel, customers in the CRM: nothing talks."],
          ["Collected every night", "Automated pipelines extract, clean and match the data."],
          ["One warehouse", "A single source of truth, historised and secured."],
          ["Live dashboards", "Revenue, margins, stock: up to date every morning, on desktop or mobile."],
          ["Useful alerts", "The information arrives before the problem costs money."],
        ],
        outcomes: [
          ["No more exports", "copied by hand into Excel"],
          ["Fresh every morning", "with no one involved"],
          ["Decisions", "made on reliable figures"],
        ],
        stack: ["Python", "Airbyte", "dbt", "PostgreSQL", "BigQuery", "Power BI", "Metabase"],
        timeline: "6 to 10 weeks",
        visual: {
          sources: ["ERP", "Excel", "CRM", "Shop"],
          warehouse: "Warehouse",
          kpis: [["Revenue", "TND 1.24M"], ["Margin", "31.8%"], ["Orders", "8,412"]],
          chart: "Sales per month",
          regions: ["Tunis", "Sfax", "Sousse", "Nabeul"],
          alert: "Low stock in Sfax: 12 units",
          dashboard: "Dashboard",
        },
      },
    ],
  },

  positions: {
    meta: "Open applications /",
    title: ["Join", "us"],
    // each row opens the application form of the main site, preset for this role
    careers: "/en/careers",
    roles: [
      { title: "DevOps engineer", tag: "DevOps", location: "Tunis", role: "devops" },
      { title: "Cloud engineer", tag: "Cloud", location: "Hybrid", role: "cloud" },
      { title: "AI / ML engineer", tag: "AI", location: "Tunis", role: "ai" },
      { title: "Data engineer", tag: "Data", location: "Remote", role: "data" },
      { title: "Security analyst", tag: "Security", location: "Tunis", role: "security" },
      { title: "Final-year internship", tag: "All teams", location: "Tunis", contract: "stage" },
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
