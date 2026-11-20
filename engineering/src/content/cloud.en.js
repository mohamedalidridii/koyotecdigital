// English copy for the four cloud pages, written as the KOYOTEC team ("we"). Mirrors cloud.fr.js key for key.
// Merged into en.js.

const cloudEn = {
  cloud: {
    callout: {
      kicker: "Specialty · Worldwide",
      title: "Cloud is our specialty.",
      copy: "AWS consulting, migration and nearshore: four pages explaining what we do, in plain words.",
      cta: "Explore our cloud services",
    },
    common: {
      ctaAudit: "Request an audit",
      ctaWhatsapp: "Message us on WhatsApp",
      whatsappText: "Hello KOYOTEC, I would like to talk about my cloud project.",
      scroll: "Scroll",
      sceneLabel: "Decorative animation",
      relatedTitle: "More cloud pages",
      relatedHeader: ["Cloud", "Read next"],
      processHeader: ["Method", "How we start"],
      processTitle: "We start with a two-week audit, at a fixed price.",
      processCopy:
        "Before touching anything, we look at what you have. You leave with a clear report that you keep, even if you never work with us afterwards.",
      process: [
        {
          title: "Week 1 · Where you stand",
          copy: "With read-only access, we review your servers, data, security, costs and the way you ship your applications. A few short conversations with your team.",
        },
        {
          title: "Week 2 · Action plan",
          copy: "A report written in plain language: risks, quick wins, possible savings and a 90-day plan, with the effort each action takes.",
        },
        {
          title: "Then · You decide",
          copy: "You run the plan with your own team, or we do it together, as a project or a monthly engagement. No lock-in.",
        },
      ],
      proofHeader: ["References", "What we have delivered"],
      proofTitle: "KOYOTEC in a few numbers.",
      proofStats: [
        { value: "50+", label: "projects delivered since 2022" },
        { value: "38", label: "startups supported with the Westerwelle Foundation" },
        { value: "0–1 h", label: "time difference with Paris" },
        { value: "3", label: "working languages: English, French, Arabic" },
      ],
      proofLinksTitle: "See our work in detail",
      proofLinks: [
        { route: "/cloud-costs", label: "AWS cost calculator", copy: "Four defaults that inflate an AWS bill, priced with real Region prices." },
        { route: "/architecture", label: "A cloud platform in 3D", copy: "Explore, layer by layer, infrastructure like the one we build." },
        { route: "/devops", label: "DevOps case studies", copy: "Autoscaling, CI/CD, on-call: context, architecture and results." },
      ],
      partner: "KOYOTEC is a registered AWS Partner.",
      founder: {
        header: ["The founder", "Med Ali Dridi"],
        name: "Med Ali Dridi",
        role: "Founder of KOYOTEC · AI/Cloud Business Strategist",
        bio: "A double engineer in computer science and electromechanics, Med Ali founded KOYOTEC in Tunis in 2022. As an AI/cloud business strategist, he bridges your business goals and the technology: he evaluates return on investment, builds the business case for leadership, sets up governance and responsible AI, and moves projects from pilot to production, without you needing hands-on coding or infrastructure administration. He also explains tech every week to a community of more than 37,000 people.",
        facts: [
          "Double engineer: computer science and electromechanical",
          "Speaker at AI Community Days Tunis 2026",
          "Finalist, JCI Ten Outstanding Young Persons of the World, Tunisia 2026",
          "Localhost Community, O'Reilly Community Partner",
        ],
        link: "Read his story",
        portraitAlt: "Portrait of Med Ali Dridi, founder of KOYOTEC",
      },
    },

    diagrams: {
      onprem: {
        title: "Servers in your office, or in the cloud",
        desc: "A simple comparison: a server bought and kept in the office, versus servers rented on demand from AWS.",
        leftTitle: "In the office",
        left: ["You buy the machine", "You pay even when it sleeps", "One failure stops everything"],
        rightTitle: "In the cloud",
        right: ["You rent by the hour", "Capacity follows your business", "Copies in several buildings"],
        arrow: "migration",
      },
      data: {
        title: "Where your data lives",
        desc: "Simplified map: Tunis and the nearest AWS data centres, in Paris, Frankfurt, Bahrain and the UAE.",
        you: "You, in Tunis",
        local: "Hosting in Tunisia",
        localNote: "if the law requires data to stay here",
        regions: [
          { name: "Paris", code: "eu-west-3" },
          { name: "Frankfurt", code: "eu-central-1" },
          { name: "Bahrain", code: "me-south-1" },
          { name: "UAE", code: "me-central-1" },
        ],
      },
      steps: {
        title: "A migration in six steps",
        desc: "The six steps of a cloud migration, from inventory to optimisation.",
        items: [
          { title: "Inventory", copy: "We list everything that runs." },
          { title: "Plan", copy: "What moves, in what order." },
          { title: "Foundations", copy: "Accounts, network, security." },
          { title: "Waves", copy: "We move small batches." },
          { title: "Cutover", copy: "D-day, with no downtime." },
          { title: "Optimise", copy: "We cut the bill." },
        ],
      },
      nearshore: {
        title: "A shared working day",
        desc: "Office hours in Paris and Tunis almost fully overlap: no time difference in winter, one hour in summer.",
        paris: "Your team in Paris",
        tunis: "Our team in Tunis",
        overlap: "same working hours",
        winter: "Winter: 0 h difference",
        summer: "Summer: 1 h difference",
      },
      layers: {
        title: "What an AWS consultant does",
        desc: "The five layers of an AWS infrastructure a consultant looks after: network, servers, data, security and costs.",
        items: [
          { title: "Network", copy: "The roads between your services and the internet." },
          { title: "Servers", copy: "The machines that run your applications." },
          { title: "Data", copy: "Databases, files, backups." },
          { title: "Security", copy: "Who is allowed to do what." },
          { title: "Costs", copy: "Pay for what you use, nothing more." },
        ],
      },
    },

    pages: {
      hub: {
        scene: "globe",
        kicker: "Cloud Tunisia · France · Worldwide",
        title: "AWS cloud engineering",
        subtitle: "from Tunis, for clients all over the world",
        lead: "Koyotec Engineering is a team of cloud engineers based in Tunis. We help companies in Tunisia, France and all over the world set up, move and secure their applications in the cloud, and pay a fair price for it.",
        explain: {
          header: ["01", "Cloud, plainly"],
          title: "The cloud means renting computers instead of buying them.",
          paras: [
            "Think of electricity. You don't own a power plant: you plug in and pay for what you use. The cloud is the same idea, for computers.",
            "Instead of buying servers and keeping them in a cupboard, you rent the computing power you need from a provider such as AWS (Amazon Web Services, Amazon's cloud). When your business grows, capacity follows. When it slows down, so does the bill.",
          ],
          diagram: "onprem",
        },
        services: {
          header: ["02", "What we do"],
          title: "From the first sketch to production.",
          items: [
            { title: "Cloud architecture", copy: "We design the infrastructure your business needs, not the one in fashion this year." },
            { title: "Cloud migration", copy: "We move your applications and data without stopping your business." },
            { title: "Kubernetes and containers", copy: "Your applications run the same way everywhere and restart on their own when something breaks." },
            { title: "Automated releases", copy: "Every new version is tested and published without manual steps (CI/CD)." },
            { title: "Cost reduction", copy: "We find what costs money for nothing and fix it, with numbers to prove it." },
            { title: "Security and backups", copy: "Limited access, encrypted data, tested backups. The baseline everyone should have." },
          ],
        },
        market: {
          header: ["03", "Tunisia, France, worldwide"],
          title: "Where should your data live?",
          paras: [
            "AWS has no data centre in Tunisia. The closest are in Paris and Frankfurt, then Bahrain and the UAE for the Gulf. From Tunis, Paris is the nearest AWS Region.",
            "If your data must stay in Tunisia, there are local hosting providers. Our job is to tell you honestly where to put it, based on your customers, your obligations and your budget, and then build it.",
          ],
          diagram: "data",
        },
        faqKey: "cloudFaqHub",
      },

      consultantTn: {
        scene: "terminal",
        kicker: "AWS consultant in Tunisia · Worldwide",
        title: "AWS consultant",
        subtitle: "cloud engineers, not another agency",
        lead: "Looking for an AWS consultant in Tunisia? At KOYOTEC you talk directly to the engineers who design your infrastructure. No salespeople, no middlemen.",
        terminal: [
          "$ terraform plan",
          "+ aws_vpc.main",
          "+ aws_eks_cluster.prod",
          "+ aws_db_instance.postgres (multi-az)",
          "~ aws_nat_gateway: 3 -> 1",
          "Plan: 12 to add, 1 to change, 0 to destroy.",
          "$ terraform apply",
        ],
        terminalNote: "Illustrative example",
        explain: {
          header: ["01", "The job, plainly"],
          title: "An AWS cloud engineer is the architect and site manager of your servers.",
          paras: [
            "An architect draws the house, a site manager makes sure it's built properly. On AWS we do both: we decide how your applications should be set up, then we set them up, secure them and monitor them.",
            "AWS offers more than 200 services. Without a guide, you often pay for options you don't need and miss the essentials. Our job is to pick only what you need and write it as code (Terraform), so everything can be reviewed and rebuilt.",
          ],
          diagram: "layers",
        },
        services: {
          header: ["02", "What we do"],
          title: "AWS consultant, cloud engineer or IT services firm: what you get.",
          items: [
            { title: "AWS account audit", copy: "Security, costs, reliability: what works, what doesn't, and where to start." },
            { title: "Infrastructure as code", copy: "Everything is written in Terraform: nothing is clicked by hand, everything can be reviewed and rebuilt." },
            { title: "Kubernetes on AWS (EKS)", copy: "For teams running several applications who want to ship them without stress." },
            { title: "CI/CD", copy: "GitHub Actions or GitLab CI: every change is tested and shipped automatically." },
            { title: "Cost optimisation", copy: "Right-sized servers, Spot instances, Savings Plans, network traffic: the bill goes down." },
            { title: "Monthly support", copy: "We stay with you to evolve and watch the infrastructure, at your team's pace." },
          ],
        },
        market: {
          header: ["03", "Why not an IT services firm?"],
          title: "IT services firm or a dedicated engineering team: the difference.",
          paras: [
            "An IT services firm often sells time: a profile, a number of days. You don't always know who actually works on your project.",
            "At KOYOTEC, the engineers who run the audit are the ones who design and deliver. You always know who works on your infrastructure, and you keep everything: the code, the documentation, the access.",
          ],
          diagram: null,
        },
        faqKey: "cloudFaqConsultantTn",
      },

      migrationTn: {
        scene: "migration",
        scrollHint: "Scroll: the server moves to the cloud, wave by wave.",
        kicker: "Cloud migration in Tunisia · Worldwide",
        title: "Cloud migration",
        subtitle: "without stopping your business",
        lead: "Are your servers ageing, failing or costing too much? We move your applications and data to AWS step by step, while your company keeps running.",
        explain: {
          header: ["01", "Migration, plainly"],
          title: "Moving to the cloud is like moving house. Better organised.",
          paras: [
            "A good move means an inventory, labelled boxes, a booked van and a new home ready before you leave. A cloud migration is the same, with your software and your data.",
            "We don't move everything at once. We start with what is simple and low-risk, check that it all works, then continue. On cutover day, your customers notice nothing.",
          ],
          diagram: "steps",
        },
        services: {
          header: ["02", "What we migrate"],
          title: "What we can move to the cloud for you.",
          items: [
            { title: "Websites and web apps", copy: "Your website, platform or business application, with a clean domain and certificate." },
            { title: "Databases", copy: "PostgreSQL, MySQL and others, copied continuously and switched over in minutes." },
            { title: "Files and backups", copy: "Your documents and archives on safe storage, with copies in several buildings." },
            { title: "ERP and internal tools", copy: "Your management software, running on reliable servers with secure access." },
            { title: "Ageing servers", copy: "The machines in the cupboard replaced by rented servers of the right size." },
            { title: "After the migration", copy: "Monitoring, backups and cost reduction, so the cloud stays worth it." },
          ],
        },
        market: {
          header: ["03", "Where to migrate"],
          title: "AWS or a local host: where to migrate?",
          paras: [
            "For most companies, AWS in Paris or Frankfurt offers the best balance of reliability, tooling and speed from Tunis. For data that must stay in Tunisia, a local hosting provider can be the right answer, or a mix of both.",
            "We don't sell hosting. So we have no reason to push you towards one provider rather than another: we recommend what suits you, and we run the migration.",
          ],
          diagram: "data",
        },
        faqKey: "cloudFaqMigrationTn",
      },

      consultantFr: {
        scene: "bridge",
        kicker: "AWS cloud consultant for France · Worldwide",
        title: "Nearshore AWS cloud consultant",
        subtitle: "from Tunis, on your hours",
        lead: "We work with companies in France and worldwide like an in-house team: close working hours, your language, the same tools. The difference shows on the invoice, not in the quality.",
        clocks: { paris: "Paris", tunis: "Tunis", note: "Live time" },
        explain: {
          header: ["01", "Nearshore, plainly"],
          title: "Nearshore means a team close by, not a team far away.",
          paras: [
            "Offshore means working with a team on the other side of the world: time differences, 6 a.m. calls, misunderstandings. Nearshore means working with a team close by, in your time zone and your language.",
            "Tunis is about two hours' flight from Paris, with no time difference in winter and one hour in summer. We work the same hours as you, in French or English, with the same tools as your team.",
          ],
          diagram: "nearshore",
        },
        services: {
          header: ["02", "What we do for you"],
          title: "Nearshore AWS migration, wherever your customers are.",
          items: [
            { title: "Migration to AWS Paris", copy: "Your applications moved to the AWS Paris Region, your data stays in France." },
            { title: "Extra hands for your team", copy: "We join your rituals (Slack, Jira, code reviews) like team members." },
            { title: "Kubernetes platform", copy: "One shared foundation to deploy all your applications the same way." },
            { title: "A smaller AWS bill", copy: "An audit priced from your real bill, then the fixes written in code." },
            { title: "Security and compliance", copy: "Access, encryption, logs and backups, aligned with your GDPR requirements." },
            { title: "Documentation and handover", copy: "Everything is documented so your team stays autonomous. You never depend on us." },
          ],
        },
        market: {
          header: ["03", "Why Tunis"],
          title: "Your teams wherever you are, our engineers in Tunis.",
          paras: [
            "Your data can stay in the AWS Paris Region (eu-west-3): only the engineers are in Tunis, not your data. It's the simplest setup for GDPR.",
            "Tunis is 0 to 1 hour from Europe and 2 to 3 hours from the Gulf. Tunisia trains many engineers who work in English, French and Arabic. For you, that means experienced engineers for less than equivalent profiles in Paris, Dubai or Singapore.",
          ],
          diagram: "data",
        },
        faqKey: "cloudFaqConsultantFr",
      },
    },
  },

  cloudFaqHub: {
    header: ["FAQ / Cloud", "Common questions"],
    title: "The cloud, your questions",
    items: [
      {
        question: "What is the cloud, in one sentence?",
        answer: [
          "Using computers in specialised data centres, rented on demand, instead of buying and keeping your own servers.",
        ],
      },
      {
        question: "How much does a cloud server cost?",
        answer: [
          "It depends on its size and how long it runs. For example, an AWS m5.2xlarge compute server (8 vCPUs, 32 GB of memory) costs $0.448 per hour at the public price in the Paris Region, about $327 per month if it runs non-stop. A small server for a website costs far less.",
          "That's exactly what the audit is for: picking the right size. Most bills we see can go down.",
        ],
      },
      {
        question: "Is there a French cloud?",
        answer: [
          "There are French providers, such as OVHcloud. AWS is American but has a Region in France, in Paris, where your data stays in France. We help you choose based on your obligations.",
        ],
      },
      {
        question: "Do you only work with AWS?",
        answer: [
          "AWS is the cloud we use most, but we also work with Azure and Google Cloud. The principles are the same: we pick the tool for your need.",
        ],
      },
      {
        question: "I'm not technical. Is this for me?",
        answer: [
          "Yes. We explain every decision in plain words, and the audit report is written for a business owner, not only for an engineer.",
        ],
      },
    ],
  },

  cloudFaqConsultantTn: {
    header: ["FAQ / AWS", "AWS consultant"],
    title: "Working with an AWS consultant",
    items: [
      {
        question: "What does an AWS consultant do?",
        answer: [
          "They design, set up and improve your infrastructure on AWS: network, servers, databases, security and costs. They also help you avoid expensive mistakes.",
        ],
      },
      {
        question: "How much does an AWS consultant in Tunisia cost?",
        answer: [
          "We always start with a two-week audit at a fixed price, agreed before we begin. After that, the project is priced as a fixed fee or a monthly engagement, whichever you prefer.",
        ],
      },
      {
        question: "What's the difference between an IT services firm and KOYOTEC?",
        answer: [
          "An IT services firm often sells days of work from various profiles. At KOYOTEC, the engineers who run the audit are the ones who design and deliver, and you keep all the code and documentation.",
        ],
      },
      {
        question: "Do you work with startups?",
        answer: [
          "Yes. We supported 38 startups as technical partner of the Westerwelle Foundation, across Tunis, Kigali and Arusha. A small team needs simple, reliable, low-cost infrastructure: that's exactly what we build.",
        ],
      },
      {
        question: "Can you work on an existing AWS account?",
        answer: [
          "Yes, that's the most common case. We start with read-only access, change nothing without your approval, and every change goes through reviewed code.",
        ],
      },
    ],
  },

  cloudFaqMigrationTn: {
    header: ["FAQ / Migration", "Cloud migration"],
    title: "Moving to the cloud: your questions",
    items: [
      {
        question: "What is a cloud migration?",
        answer: [
          "Moving your applications, data and servers from your own machines to servers rented in the cloud, such as AWS.",
        ],
      },
      {
        question: "How long does a migration take?",
        answer: [
          "For a simple website or application, a few days to a few weeks. For a complete IT system, a few months, in successive waves. The audit gives you a realistic timeline before we start.",
        ],
      },
      {
        question: "Will my business stop during the migration?",
        answer: [
          "No, that's the whole point. Data is copied continuously to the cloud, then we switch over in minutes, at your quietest hour, with a rollback plan ready.",
        ],
      },
      {
        question: "How much does a cloud migration cost?",
        answer: [
          "It depends on the number of applications and how complex they are. After the two-week audit, you get a fixed-fee quote and a month-by-month estimate of your future cloud bill.",
        ],
      },
      {
        question: "Can my data stay in Tunisia?",
        answer: [
          "AWS has no data centre in Tunisia. If your data must stay in the country, we point you to a local hosting provider or a hybrid setup, and we handle the migration.",
        ],
      },
    ],
  },

  cloudFaqConsultantFr: {
    header: ["FAQ / France", "Nearshore AWS"],
    title: "Working with us remotely",
    items: [
      {
        question: "Does my data leave France?",
        answer: [
          "No, if you don't want it to. We set up your infrastructure in the AWS Paris Region (eu-west-3). We work remotely with controlled, logged access, without copying your data elsewhere.",
        ],
      },
      {
        question: "How does remote work look day to day?",
        answer: [
          "We join your tools (Slack or Teams, Jira, GitHub or GitLab) and your meetings, at the same hours as your team. Tunis is 0 hours from Paris in winter and 1 hour in summer.",
        ],
      },
      {
        question: "What if an engineer is unavailable?",
        answer: [
          "Everything we build is written as code and documented. Another KOYOTEC engineer can take over, and so can your own team: you're never stuck.",
        ],
      },
      {
        question: "Why an AWS consultant in Tunisia rather than in France?",
        answer: [
          "For the same level of engineering, the cost is lower than an equivalent consultant in Paris, with the same language and hours. You start with a fixed-price audit to judge on evidence.",
        ],
      },
      {
        question: "Do I have to commit long term?",
        answer: [
          "No. The two-week audit has a fixed price and the report is yours. Then you decide whether we continue together, as a project or a monthly engagement.",
        ],
      },
    ],
  },
};

export default cloudEn;
