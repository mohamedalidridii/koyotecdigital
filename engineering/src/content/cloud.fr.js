// Copy for the four cloud pages (/cloud, /cloud/consultant-aws-tunisie, /cloud/migration-cloud-tunisie,
// /cloud/consultant-aws-france). Written as the KOYOTEC team ("nous"), for readers who know nothing about
// the cloud, with a short introduction of the founder. cloud.en.js mirrors these keys exactly. Merged into fr.js.
// Facts only: what is public on /medalydridi and on this site. No certification claims.

const cloudFr = {
  cloud: {
    callout: {
      kicker: "Spécialité · Monde",
      title: "Le cloud est notre spécialité.",
      copy: "Conseil AWS, migration et nearshore : quatre pages pour comprendre ce que nous faisons, expliqué simplement.",
      cta: "Découvrir notre offre cloud",
    },
    common: {
      ctaAudit: "Demander un audit",
      ctaWhatsapp: "Nous écrire sur WhatsApp",
      whatsappText: "Bonjour KOYOTEC, je voudrais parler de mon projet cloud.",
      scroll: "Défiler",
      sceneLabel: "Animation décorative",
      relatedTitle: "Les autres pages cloud",
      relatedHeader: ["Cloud", "À lire aussi"],
      processHeader: ["Méthode", "Comment on démarre"],
      processTitle: "On commence par un audit de deux semaines, à prix fixe.",
      processCopy:
        "Avant de toucher à quoi que ce soit, nous regardons ce que vous avez. Vous repartez avec un rapport clair, que vous gardez, même si vous ne travaillez pas avec nous ensuite.",
      process: [
        {
          title: "Semaine 1 · État des lieux",
          copy: "Avec un accès en lecture seule, nous faisons le tour de vos serveurs, de vos données, de la sécurité, des coûts et de la façon dont vous mettez vos applications en ligne. Quelques échanges courts avec votre équipe.",
        },
        {
          title: "Semaine 2 · Plan d'action",
          copy: "Un rapport écrit en langage simple : les risques, les gains rapides, les économies possibles et un plan sur 90 jours, avec l'effort de chaque action.",
        },
        {
          title: "Ensuite · Vous choisissez",
          copy: "Vous appliquez le plan avec votre équipe, ou nous le faisons ensemble, en projet ou en accompagnement mensuel. Sans engagement.",
        },
      ],
      proofHeader: ["Références", "Ce que nous avons livré"],
      proofTitle: "KOYOTEC en quelques chiffres.",
      proofStats: [
        { value: "50+", label: "projets livrés depuis 2022" },
        { value: "38", label: "startups accompagnées avec la Westerwelle Foundation" },
        { value: "0–1 h", label: "de décalage horaire avec Paris" },
        { value: "3", label: "langues de travail : français, anglais, arabe" },
      ],
      proofLinksTitle: "Découvrez notre travail en détail",
      proofLinks: [
        { route: "/cloud-costs", label: "Calculateur de coûts AWS", copy: "Quatre réglages qui gonflent une facture AWS, chiffrés avec les vrais prix." },
        { route: "/architecture", label: "Plateforme cloud en 3D", copy: "Explorez, couche par couche, une infrastructure comme celles que nous construisons." },
        { route: "/devops", label: "Études de cas DevOps", copy: "Autoscaling, CI/CD, astreinte : contexte, architecture et résultats." },
      ],
      partner: "KOYOTEC est partenaire AWS enregistré.",
      founder: {
        header: ["Le fondateur", "Med Ali Dridi"],
        name: "Med Ali Dridi",
        role: "Fondateur de KOYOTEC · Stratège business IA & cloud",
        bio: "Double ingénieur en informatique et en électromécanique, Med Ali a fondé KOYOTEC à Tunis en 2022. Stratège business IA et cloud, il fait le lien entre vos objectifs business et la technologie : il évalue le retour sur investissement, construit le dossier pour la direction, encadre la gouvernance et l'IA responsable, et aide vos projets à passer du pilote au déploiement, sans que vous ayez besoin de coder ou d'administrer une infrastructure. Il explique aussi la tech chaque semaine à une communauté de plus de 37 000 personnes.",
        facts: [
          "Double ingénieur : informatique et électromécanique",
          "Speaker aux AI Community Days Tunis 2026",
          "Finaliste JCI Ten Outstanding Young Persons of the World, Tunisie 2026",
          "Localhost Community, O'Reilly Community Partner",
        ],
        link: "Découvrir son parcours",
        portraitAlt: "Portrait de Med Ali Dridi, fondateur de KOYOTEC",
      },
    },

    diagrams: {
      onprem: {
        title: "Vos serveurs au bureau, ou dans le cloud",
        desc: "Comparaison simple : un serveur acheté et gardé au bureau, contre des serveurs loués à la demande chez AWS.",
        leftTitle: "Au bureau",
        left: ["Vous achetez la machine", "Vous payez même quand elle dort", "Une panne, et tout s'arrête"],
        rightTitle: "Dans le cloud",
        right: ["Vous louez à l'heure", "La capacité suit votre activité", "Copies dans plusieurs bâtiments"],
        arrow: "migration",
      },
      data: {
        title: "Où vivent vos données",
        desc: "Carte simplifiée : Tunis et les centres de données AWS les plus proches, à Paris, Francfort, Bahreïn et aux Émirats.",
        you: "Vous, à Tunis",
        local: "Hébergeurs en Tunisie",
        localNote: "si la loi impose de garder les données ici",
        regions: [
          { name: "Paris", code: "eu-west-3" },
          { name: "Francfort", code: "eu-central-1" },
          { name: "Bahreïn", code: "me-south-1" },
          { name: "Émirats", code: "me-central-1" },
        ],
      },
      steps: {
        title: "Une migration en six étapes",
        desc: "Les six étapes d'une migration vers le cloud, de l'inventaire à l'optimisation.",
        items: [
          { title: "Inventaire", copy: "On liste tout ce qui tourne." },
          { title: "Plan", copy: "Quoi déplacer, dans quel ordre." },
          { title: "Fondations", copy: "Comptes, réseau, sécurité." },
          { title: "Vagues", copy: "On déplace par petits lots." },
          { title: "Bascule", copy: "Le jour J, sans coupure." },
          { title: "Optimisation", copy: "On réduit la facture." },
        ],
      },
      nearshore: {
        title: "Une journée de travail partagée",
        desc: "Les heures de bureau à Paris et à Tunis se recouvrent presque entièrement : 0 heure de décalage en hiver, 1 heure en été.",
        paris: "Votre équipe à Paris",
        tunis: "Notre équipe à Tunis",
        overlap: "mêmes heures de travail",
        winter: "Hiver : 0 h de décalage",
        summer: "Été : 1 h de décalage",
      },
      layers: {
        title: "Ce que fait un consultant AWS",
        desc: "Les cinq couches d'une infrastructure AWS dont s'occupe un consultant : réseau, serveurs, données, sécurité et coûts.",
        items: [
          { title: "Réseau", copy: "Les routes entre vos services et Internet." },
          { title: "Serveurs", copy: "Les machines qui font tourner vos applications." },
          { title: "Données", copy: "Bases de données, fichiers, sauvegardes." },
          { title: "Sécurité", copy: "Qui a le droit de faire quoi." },
          { title: "Coûts", copy: "Payer ce que vous utilisez, pas plus." },
        ],
      },
    },

    pages: {
      hub: {
        scene: "globe",
        kicker: "Cloud Tunisie · France · Monde",
        title: "Ingénierie cloud AWS",
        subtitle: "depuis Tunis, pour des clients partout dans le monde",
        lead: "Koyotec Engineering est une équipe d'ingénieurs cloud basée à Tunis. Nous aidons les entreprises en Tunisie, en France et partout dans le monde à installer, déplacer et sécuriser leurs applications dans le cloud, et à payer le juste prix.",
        explain: {
          header: ["01", "Le cloud, simplement"],
          title: "Le cloud, c'est louer des ordinateurs au lieu de les acheter.",
          paras: [
            "Pensez à l'électricité. Vous n'avez pas de centrale chez vous : vous branchez une prise et vous payez ce que vous consommez. Le cloud, c'est la même idée pour les ordinateurs.",
            "Au lieu d'acheter des serveurs et de les garder dans un placard, vous louez la puissance dont vous avez besoin chez un fournisseur comme AWS (Amazon Web Services, le cloud d'Amazon). Quand votre activité grandit, la capacité suit. Quand elle baisse, la facture baisse.",
          ],
          diagram: "onprem",
        },
        services: {
          header: ["02", "Ce que nous faisons"],
          title: "Du premier schéma jusqu'à la mise en production.",
          items: [
            { title: "Architecture cloud", copy: "Nous dessinons l'infrastructure qui correspond à votre activité, pas à la mode du moment." },
            { title: "Migration vers le cloud", copy: "Nous déplaçons vos applications et vos données sans arrêter votre activité." },
            { title: "Kubernetes et conteneurs", copy: "Vos applications tournent de la même façon partout, et redémarrent seules en cas de souci." },
            { title: "Mises en ligne automatiques", copy: "Chaque nouvelle version est testée puis publiée sans intervention manuelle (CI/CD)." },
            { title: "Réduction des coûts", copy: "Nous trouvons ce qui coûte cher pour rien et nous le corrigeons, chiffres à l'appui." },
            { title: "Sécurité et sauvegardes", copy: "Accès limités, données chiffrées, sauvegardes testées. Le minimum que tout le monde devrait avoir." },
          ],
        },
        market: {
          header: ["03", "Tunisie, France, monde"],
          title: "Où mettre vos données ?",
          paras: [
            "AWS n'a pas de centre de données en Tunisie. Les plus proches sont à Paris et à Francfort, puis à Bahreïn et aux Émirats pour le Golfe. Depuis Tunis, Paris est la région AWS la plus proche.",
            "Si vos données doivent rester en Tunisie, il existe des hébergeurs locaux. Notre rôle est de vous dire honnêtement où les mettre, selon vos clients, vos obligations et votre budget, puis de construire l'ensemble.",
          ],
          diagram: "data",
        },
        faqKey: "cloudFaqHub",
      },

      consultantTn: {
        scene: "terminal",
        kicker: "Consultant AWS en Tunisie · Monde",
        title: "Consultant AWS",
        subtitle: "des ingénieurs cloud, pas une ESN de plus",
        lead: "Vous cherchez un consultant AWS en Tunisie ? Chez KOYOTEC, vous parlez directement aux ingénieurs qui conçoivent votre infrastructure. Pas de commercial, pas d'intermédiaire.",
        terminal: [
          "$ terraform plan",
          "+ aws_vpc.main",
          "+ aws_eks_cluster.prod",
          "+ aws_db_instance.postgres (multi-az)",
          "~ aws_nat_gateway: 3 -> 1",
          "Plan: 12 to add, 1 to change, 0 to destroy.",
          "$ terraform apply",
        ],
        terminalNote: "Exemple illustratif",
        explain: {
          header: ["01", "Le métier, simplement"],
          title: "Un ingénieur cloud AWS, c'est l'architecte et le chef de chantier de vos serveurs.",
          paras: [
            "Un architecte dessine la maison, un chef de chantier la fait construire correctement. Sur AWS, nous faisons les deux : nous décidons comment vos applications doivent être installées, puis nous les installons, les sécurisons et les surveillons.",
            "AWS propose plus de 200 services. Sans guide, on paie souvent des options inutiles et on oublie l'essentiel. Notre travail est de choisir le strict nécessaire, et de l'écrire sous forme de code (Terraform) pour que tout soit reproductible et vérifiable.",
          ],
          diagram: "layers",
        },
        services: {
          header: ["02", "Ce que nous faisons"],
          title: "Consultant AWS, ingénieur cloud ou ESN cloud : ce que vous obtenez.",
          items: [
            { title: "Audit de votre compte AWS", copy: "Sécurité, coûts, fiabilité : nous vous disons ce qui va, ce qui ne va pas, et par quoi commencer." },
            { title: "Infrastructure en code", copy: "Tout est écrit avec Terraform : rien n'est configuré à la main, tout peut être relu et refait." },
            { title: "Kubernetes sur AWS (EKS)", copy: "Pour les équipes qui ont plusieurs applications et veulent les déployer sans stress." },
            { title: "CI/CD", copy: "GitHub Actions ou GitLab CI : chaque modification est testée puis mise en ligne automatiquement." },
            { title: "Optimisation des coûts", copy: "Bonne taille de serveurs, instances Spot, Savings Plans, trafic réseau : la facture baisse." },
            { title: "Accompagnement mensuel", copy: "Nous restons à vos côtés pour faire évoluer et surveiller l'infrastructure, au rythme de votre équipe." },
          ],
        },
        market: {
          header: ["03", "Pourquoi pas une ESN ?"],
          title: "ESN cloud ou équipe d'ingénieurs dédiée : la différence.",
          paras: [
            "Une ESN (entreprise de services du numérique) vend souvent du temps : un profil, un nombre de jours. Vous ne savez pas toujours qui travaille vraiment sur votre projet.",
            "Chez KOYOTEC, les ingénieurs qui font l'audit sont ceux qui conçoivent et qui livrent. Vous savez toujours qui travaille sur votre infrastructure, et vous gardez tout : le code, la documentation, les accès.",
          ],
          diagram: null,
        },
        faqKey: "cloudFaqConsultantTn",
      },

      migrationTn: {
        scene: "migration",
        scrollHint: "Faites défiler : le serveur part dans le cloud, vague par vague.",
        kicker: "Migration cloud en Tunisie · Monde",
        title: "Migration cloud",
        subtitle: "sans arrêter votre activité",
        lead: "Vos serveurs vieillissent, tombent en panne ou coûtent trop cher ? Nous déplaçons vos applications et vos données vers le cloud AWS, étape par étape, pendant que votre entreprise continue de tourner.",
        explain: {
          header: ["01", "La migration, simplement"],
          title: "Migrer vers le cloud, c'est déménager. En mieux organisé.",
          paras: [
            "Un bon déménagement, c'est un inventaire, des cartons étiquetés, un camion réservé et une nouvelle maison prête avant de partir. Une migration cloud, c'est pareil, avec vos logiciels et vos données.",
            "On ne déplace pas tout d'un coup. On commence par ce qui est simple et peu risqué, on vérifie que tout fonctionne, puis on continue. Le jour de la bascule, vos clients ne voient rien.",
          ],
          diagram: "steps",
        },
        services: {
          header: ["02", "Ce que nous migrons"],
          title: "Ce que nous pouvons déplacer vers le cloud pour vous.",
          items: [
            { title: "Sites et applications web", copy: "Votre site, votre plateforme ou votre application métier, avec un nom de domaine et un certificat propres." },
            { title: "Bases de données", copy: "PostgreSQL, MySQL et autres, copiées en continu puis basculées en quelques minutes." },
            { title: "Fichiers et sauvegardes", copy: "Vos documents et archives sur un stockage sûr, avec des copies dans plusieurs bâtiments." },
            { title: "ERP et logiciels internes", copy: "Vos outils de gestion, installés sur des serveurs fiables et accessibles en sécurité." },
            { title: "Serveurs vieillissants", copy: "Les machines du placard remplacées par des serveurs loués, de la bonne taille." },
            { title: "Après la migration", copy: "Surveillance, sauvegardes et réduction des coûts, pour que le cloud reste rentable." },
          ],
        },
        market: {
          header: ["03", "Où migrer"],
          title: "AWS ou hébergeur local : où migrer ?",
          paras: [
            "Pour la plupart des entreprises, AWS à Paris ou à Francfort offre le meilleur équilibre : fiabilité, outils et rapidité depuis Tunis. Pour des données qui doivent rester sur le territoire tunisien, un hébergeur local peut être la bonne réponse, ou un mélange des deux.",
            "Nous ne vendons pas d'hébergement. Nous n'avons donc aucun intérêt à vous pousser vers un fournisseur plutôt qu'un autre : nous vous recommandons ce qui vous convient, et nous faisons la migration.",
          ],
          diagram: "data",
        },
        faqKey: "cloudFaqMigrationTn",
      },

      consultantFr: {
        scene: "bridge",
        kicker: "Consultant cloud AWS en France · Monde",
        title: "Consultant cloud AWS nearshore",
        subtitle: "depuis Tunis, à votre heure",
        lead: "Nous travaillons avec des entreprises en France et partout dans le monde comme une équipe interne : horaires proches, même langue, mêmes outils. La différence se voit sur la facture, pas sur la qualité.",
        clocks: { paris: "Paris", tunis: "Tunis", note: "Heure en direct" },
        explain: {
          header: ["01", "Le nearshore, simplement"],
          title: "Le nearshore, c'est une équipe proche, pas une équipe lointaine.",
          paras: [
            "Offshore, c'est travailler avec une équipe à l'autre bout du monde : décalage horaire, réunions à 6 heures du matin, malentendus. Nearshore, c'est travailler avec une équipe proche, dans votre fuseau horaire et votre langue.",
            "Tunis est à environ deux heures d'avion de Paris, avec 0 heure de décalage en hiver et 1 heure en été. Nous travaillons aux mêmes heures que vous, en français, avec les mêmes outils que votre équipe.",
          ],
          diagram: "nearshore",
        },
        services: {
          header: ["02", "Ce que nous faisons pour vous"],
          title: "Migration AWS nearshore, où que soient vos clients.",
          items: [
            { title: "Migration vers AWS Paris", copy: "Vos applications déplacées vers la région AWS de Paris, vos données restent en France." },
            { title: "Renfort de votre équipe", copy: "Nous rejoignons vos rituels (Slack, Jira, revues de code) comme des membres de l'équipe." },
            { title: "Plateforme Kubernetes", copy: "Un socle commun pour déployer toutes vos applications de la même façon." },
            { title: "Réduction de la facture AWS", copy: "Un audit chiffré à partir de votre facture réelle, puis les corrections dans le code." },
            { title: "Sécurité et conformité", copy: "Accès, chiffrement, journaux et sauvegardes, alignés sur vos exigences RGPD." },
            { title: "Documentation et transfert", copy: "Tout est documenté pour que votre équipe reste autonome. Vous ne dépendez jamais de nous." },
          ],
        },
        market: {
          header: ["03", "Pourquoi Tunis"],
          title: "Vos équipes où que vous soyez, nos ingénieurs à Tunis.",
          paras: [
            "Vos données peuvent rester dans la région AWS de Paris (eu-west-3) : seuls les ingénieurs sont à Tunis, pas vos données. C'est la configuration la plus simple pour respecter le RGPD.",
            "Tunis est à 0 à 1 heure de l'Europe et à 2 ou 3 heures du Golfe. La Tunisie forme de nombreux ingénieurs, qui travaillent en français, en anglais et en arabe. Pour vous, ce sont des ingénieurs expérimentés pour un coût inférieur à celui de profils équivalents à Paris, Dubaï ou Singapour.",
          ],
          diagram: "data",
        },
        faqKey: "cloudFaqConsultantFr",
      },
    },
  },

  cloudFaqHub: {
    header: ["FAQ / Cloud", "Questions fréquentes"],
    title: "Le cloud, vos questions",
    items: [
      {
        question: "C'est quoi le cloud, en une phrase ?",
        answer: [
          "Utiliser des ordinateurs situés dans des centres de données spécialisés, loués à la demande, au lieu d'acheter et de garder vos propres serveurs.",
        ],
      },
      {
        question: "Quel est le prix d'un serveur cloud en Tunisie ?",
        answer: [
          "Cela dépend de sa taille et du temps où il tourne. À titre d'exemple, un serveur de calcul AWS m5.2xlarge (8 processeurs, 32 Go de mémoire) coûte 0,448 $ de l'heure au prix public dans la région de Paris, soit environ 327 $ par mois s'il tourne en continu. Un petit serveur pour un site coûte beaucoup moins.",
          "L'audit sert justement à choisir la bonne taille : la plupart des factures que nous voyons peuvent baisser.",
        ],
      },
      {
        question: "Quel cloud est français ?",
        answer: [
          "Il existe des fournisseurs français, comme OVHcloud. AWS, lui, est américain mais possède une région en France, à Paris, où vos données restent sur le territoire français. Nous vous aidons à choisir selon vos obligations.",
        ],
      },
      {
        question: "Travaillez-vous seulement avec AWS ?",
        answer: [
          "AWS est le cloud que nous utilisons le plus, mais nous travaillons aussi avec Azure et Google Cloud. Les principes sont les mêmes : nous choisissons l'outil selon votre besoin.",
        ],
      },
      {
        question: "Je ne suis pas technique. Est-ce pour moi ?",
        answer: [
          "Oui. Nous vous expliquons chaque décision avec des mots simples, et le rapport d'audit est écrit pour un dirigeant, pas seulement pour un ingénieur.",
        ],
      },
    ],
  },

  cloudFaqConsultantTn: {
    header: ["FAQ / AWS", "Consultant AWS"],
    title: "Travailler avec un consultant AWS",
    items: [
      {
        question: "Que fait un consultant AWS ?",
        answer: [
          "Il conçoit, installe et améliore votre infrastructure sur AWS : réseau, serveurs, bases de données, sécurité et coûts. Il vous aide aussi à éviter les erreurs qui coûtent cher.",
        ],
      },
      {
        question: "Combien coûte un consultant AWS en Tunisie ?",
        answer: [
          "Nous commençons toujours par un audit de deux semaines à prix fixe, annoncé avant de démarrer. Ensuite, le projet est chiffré au forfait ou en accompagnement mensuel, selon ce que vous préférez.",
        ],
      },
      {
        question: "Quelle différence entre une ESN cloud et KOYOTEC ?",
        answer: [
          "Une ESN vend souvent des jours de travail de profils variés. Chez KOYOTEC, les ingénieurs qui font l'audit sont ceux qui conçoivent et qui livrent, et vous gardez tout le code et la documentation.",
        ],
      },
      {
        question: "Travaillez-vous avec des startups ?",
        answer: [
          "Oui. Nous avons accompagné 38 startups comme partenaire technique de la Westerwelle Foundation, entre Tunis, Kigali et Arusha. Une petite équipe a besoin d'une infrastructure simple, fiable et peu chère : c'est exactement ce que nous construisons.",
        ],
      },
      {
        question: "Pouvez-vous intervenir sur un compte AWS existant ?",
        answer: [
          "Oui, c'est même le cas le plus fréquent. Nous commençons avec un accès en lecture seule, nous ne modifions rien sans votre accord, et chaque changement passe par du code relu.",
        ],
      },
    ],
  },

  cloudFaqMigrationTn: {
    header: ["FAQ / Migration", "Migration cloud"],
    title: "Migrer vers le cloud : vos questions",
    items: [
      {
        question: "Qu'est-ce que la migration cloud ?",
        answer: [
          "C'est déplacer vos applications, vos données et vos serveurs depuis vos propres machines vers des serveurs loués dans le cloud, comme AWS.",
        ],
      },
      {
        question: "Combien de temps dure une migration ?",
        answer: [
          "Pour un site ou une application simple, quelques jours à quelques semaines. Pour un système d'information complet, quelques mois, par vagues successives. L'audit vous donne un calendrier réaliste avant de commencer.",
        ],
      },
      {
        question: "Mon activité va-t-elle s'arrêter pendant la migration ?",
        answer: [
          "Non, c'est tout l'objectif. Les données sont copiées en continu vers le cloud, puis on bascule en quelques minutes, à l'heure la plus calme pour vous, avec un retour arrière prévu.",
        ],
      },
      {
        question: "Combien coûte une migration cloud ?",
        answer: [
          "Cela dépend du nombre d'applications et de leur complexité. Après l'audit de deux semaines, vous recevez un devis au forfait et une estimation de votre future facture cloud, mois par mois.",
        ],
      },
      {
        question: "Mes données peuvent-elles rester en Tunisie ?",
        answer: [
          "AWS n'a pas de centre de données en Tunisie. Si vos données doivent rester sur le territoire, nous vous orientons vers un hébergeur local ou une solution mixte, et nous nous occupons de la migration.",
        ],
      },
    ],
  },

  cloudFaqConsultantFr: {
    header: ["FAQ / France", "Nearshore AWS"],
    title: "Travailler avec nous à distance",
    items: [
      {
        question: "Vos données sortent-elles de France ?",
        answer: [
          "Non, si vous le souhaitez. Nous installons votre infrastructure dans la région AWS de Paris (eu-west-3). Nous travaillons à distance avec des accès contrôlés et tracés, sans copier vos données ailleurs.",
        ],
      },
      {
        question: "Comment se passe le travail à distance au quotidien ?",
        answer: [
          "Nous rejoignons vos outils (Slack ou Teams, Jira, GitHub ou GitLab) et vos réunions, aux mêmes heures que votre équipe. Tunis est à 0 heure de Paris en hiver et à 1 heure en été.",
        ],
      },
      {
        question: "Et si un ingénieur n'est pas disponible ?",
        answer: [
          "Tout ce que nous construisons est écrit en code et documenté. Un autre ingénieur KOYOTEC peut prendre le relais, et votre propre équipe aussi : vous n'êtes jamais bloqué.",
        ],
      },
      {
        question: "Pourquoi un consultant AWS en Tunisie plutôt qu'en France ?",
        answer: [
          "Pour le même niveau d'ingénierie, le coût est inférieur à celui d'un consultant équivalent à Paris, avec la même langue et les mêmes horaires. Vous commencez par un audit à prix fixe pour juger sur pièces.",
        ],
      },
      {
        question: "Faut-il s'engager sur la durée ?",
        answer: [
          "Non. L'audit de deux semaines est à prix fixe et le rapport vous appartient. Ensuite, vous décidez si nous continuons ensemble, en projet ou en accompagnement mensuel.",
        ],
      },
    ],
  },
};

export default cloudFr;
