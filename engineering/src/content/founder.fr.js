// Copy for the founder page of the Engineering site (/medalydridi). Written in the third person, with the
// engineering and strategy angle; the full personal story stays on koyotec.digital/medalydridi.
// founder.en.js mirrors these keys exactly. Merged into fr.js. Facts only, as published on the main founder page.

const founderFr = {
  founderPage: {
    kicker: "Le fondateur · Koyotec Engineering",
    name: "Med Ali Dridi",
    roles: ["Fondateur de KOYOTEC", "Ingénieur cloud & DevOps", "Stratège business IA & cloud"],
    lead: "Double ingénieur en informatique et en électromécanique, Mohamed Ali Dridi a fondé KOYOTEC à Tunis en 2022. Il dirige Koyotec Engineering, l'équipe qui conçoit des systèmes cloud, DevOps et IA pour des entreprises partout dans le monde.",
    portraitAlt: "Portrait de Mohamed Ali Dridi (Med Ali Dridi), fondateur de KOYOTEC",
    stageAlt: "Med Ali Dridi en conférence, expliquant un réseau de neurones",
    ctaWork: "Travailler avec nous",
    ctaStory: "Son histoire complète",

    numbers: {
      header: ["En chiffres", "Depuis 2022"],
      items: [
        { value: "50+", label: "projets livrés avec KOYOTEC" },
        { value: "38", label: "startups accompagnées avec la Westerwelle Foundation" },
        { value: "37,7K", label: "abonnés à ses contenus tech sur Instagram" },
        { value: "4K+", label: "abonnés sur LinkedIn" },
      ],
    },

    roles2: {
      header: ["Deux métiers", "Un seul interlocuteur"],
      title: "L'ingénieur qui construit, le stratège qui décide avec vous.",
      engineering: {
        title: "Ingénieur cloud & DevOps",
        copy: "Il conçoit des architectures cloud qui tiennent la charge, et les écrit sous forme de code pour qu'elles soient fiables et reproductibles.",
        items: ["Architecture AWS et multi-cloud", "Kubernetes, Docker, Terraform", "Kafka, PostgreSQL, CI/CD", "IA appliquée et machine learning"],
      },
      strategy: {
        title: "Stratège business IA & cloud",
        copy: "Il fait le lien entre vos objectifs business et la technologie, sans que vous ayez besoin de coder ou d'administrer une infrastructure.",
        items: ["Évaluer le retour sur investissement", "Construire le dossier pour la direction", "Gouvernance et IA responsable", "Passer du pilote au déploiement"],
      },
    },

    timeline: {
      header: ["Parcours", "2022 à aujourd'hui"],
      title: "Les étapes depuis 2022.",
      items: [
        { year: "2022", text: "Fondation de KOYOTEC à Tunis." },
        { year: "2025", text: "Fondation de Localhost Community, devenue O'Reilly Community Partner. TN-Container, une alternative open source à Docker écrite en Go." },
        { year: "2026", text: "Speaker aux AI Community Days Tunis. Finaliste JCI Ten Outstanding Young Persons of the World, Tunisie 2026." },
      ],
    },

    gallery: [
      { src: "/images/founder/pyfac-speaker.webp", alt: "Med Ali Dridi présenté comme speaker à PyFAC (Pitch Yourself For A Career)", w: 1310, h: 790 },
      { src: "/images/founder/pyfac-stage.webp", alt: "Med Ali Dridi en conférence sur scène à PyFAC", w: 1439, h: 838 },
    ],
    galleryCredit: "Photo : PyFAC (Pitch Yourself For A Career)",
    talks: {
      header: ["Sur scène", "Conférences et ateliers"],
      title: "Il parle d'IA, de cloud et de DevOps comme il les pratique : avec des systèmes réels.",
      items: [
        { date: "29 avril 2026", event: "AI Community Days · AI Innovation Summit, IACE Tunis", title: "The Algorithm of Truth: How to Talk to Machines When Lives Are on the Line" },
        { date: "2025", event: "Fork it!", title: "The Algorithm of Grief : un modèle de machine learning pour la détection précoce de la sclérodermie" },
        { date: "2025", event: "Orbit 1.0 · IEEE INSAT", title: "Atelier Docker 101" },
        { date: "2025", event: "Gigwave Forum (Bizerte) et PyFAC (Sfax)", title: "Du freelance à l'agence digitale" },
      ],
    },

    profiles: {
      header: ["Profils", "Vérifiables"],
      title: "Ses profils publics.",
      items: [
        { label: "LinkedIn", handle: "med-ali-dridi", href: "https://www.linkedin.com/in/med-ali-dridi/" },
        { label: "GitHub", handle: "mohamedalidridii", href: "https://github.com/mohamedalidridii" },
        { label: "YouTube", handle: "@medaly.dridiy", href: "https://www.youtube.com/@medaly.dridiy" },
        { label: "Instagram", handle: "@medaly.dridi", href: "https://www.instagram.com/medaly.dridi/" },
        { label: "Sessionize", handle: "mohamed-ali-dridi", href: "https://sessionize.com/mohamed-ali-dridi/" },
        { label: "AI Community Days", handle: "speaker", href: "https://aicommunitydays.ai/speakers/mohamed-ali-dridi" },
        { label: "dev.to", handle: "medalydridi", href: "https://dev.to/medalydridi" },
      ],
    },
  },
};

export default founderFr;
