// Texte français de /devops-trends-2027 : six changements DevOps et plateforme pour 2027–2028, écrit pour
// les CTO et les responsables plateforme et sécurité. Chaque date et chiffre externe a sa source primaire
// dans `sources` (vérifiées le 27 novembre 2026, après deux relectures indépendantes). Seule la section
// GPU / coûts Kubernetes porte notre offre : c’est celle que nous réalisons. Miroir de devopsTrends.en.js,
// clé pour clé. Fusionné dans fr.js.

const devopsTrendsFr = {
  devopsTrends: {
    header: ["Guide / DevOps 2027–2028", "6 changements · {n} sources primaires"],
    audience: "Pour les CTO, responsables plateforme et sécurité",
    title: "Six changements sont assez proches pour être préparés dès maintenant. Chacun s’accompagne d’une date, d’un coût ou d’un risque que vous pouvez vérifier ce mois-ci.",
    byline: { by: "Par", name: "Mohamed Ali Dridi", role: "fondateur de KOYOTEC Engineering", checked: "Informations vérifiées le 27 novembre 2026" },
    intro: [
      "La plupart des surprises d’infrastructure sont annoncées des années à l’avance. Une norme est publiée, une échéance est fixée, un fournisseur cloud s’engage sur une date, et le travail arrive plus tard chez les équipes plateforme, souvent sous la forme d’une panne ou d’un constat d’audit.",
      "Pour chacun des six changements ci-dessous : ce qui change, ce qui casse ou coûte de l’argent, qui est concerné, une première vérification que votre équipe peut faire, et comment y remédier. L’ordre suit l’argent d’abord, puis le risque, puis le délai de préparation.",
    ],
    jump: "Voir les six changements",
    tableTitle: "Le résumé : six changements, un tableau",
    tableCols: ["Changement", "Pourquoi maintenant", "Signes que vous êtes concerné", "Première étape"],
    tableRows: [
      ["Ordonnancement et coûts des GPU (Kubernetes DRA)", "DRA stable depuis Kubernetes 1.34, alors que les factures GPU grimpent avec l’IA", "Des GPU entiers par pod, une faible activité des SM, des nœuds GPU allumés la nuit", "Exporter deux semaines de métriques GPU"],
      ["Identité des services et des agents IA", "28,65 millions de secrets publiés sur GitHub public en 2025", "Clés d’API partagées, secrets dans des variables d’environnement", "Lister chaque identifiant non humain et qui l’utilise"],
      ["TLS post-quantique et certificats plus courts", "Certificats TLS publics limités à 100 jours à partir du 15 mars 2027 ; le NIST déprécie les algorithmes classiques après 2030", "Renouvellements manuels, CA internes à longue durée, anciens répartiteurs de charge", "Inventorier vos CA et chaque point de terminaison TLS"],
      ["Politiques d’admission à grande échelle (CEL)", "Kyverno 1.20 n’exécute plus les anciennes ClusterPolicies ; MutatingAdmissionPolicy stable depuis Kubernetes 1.36", "Plusieurs webhooks sur chaque requête d’API", "Lister vos webhooks et vos moteurs de politiques"],
      ["Sécurité à l’exécution au niveau du noyau (eBPF)", "De plus en plus de code généré ou tiers dans les clusters", "Aucune politique de sécurité à l’exécution, ou des alertes que personne ne traite", "Vérifier que BPF LSM est activé sur vos nœuds"],
      ["Informatique confidentielle", "Données réglementées et poids de modèles qui migrent vers le cloud public", "Votre seule réponse : « chiffré au repos et en transit »", "Lister les charges de travail qui ne peuvent pas quitter vos locaux"],
    ],
    offer: {
      kicker: "Ce que nous faisons pour vous",
      title: "Coûts Kubernetes et GPU : le chantier que nous réalisons nous-mêmes.",
      text: "Une revue avec un accès en lecture seule à vos métriques et à votre facture : l’activité réelle de vos GPU et de vos nœuds, ce que vous payez pour de la capacité inactive, et un plan chiffré (redimensionnement, autoscaling, partage des GPU avec MIG ou time-slicing, DRA là où vos versions et vos pilotes le permettent). Vous recevez un rapport écrit avec l’économie attendue pour chaque changement. Si vous décidez d’avancer, nous le mettons en œuvre avec vous et comparons la facture avant et après.",
      cta: "Demander une revue des coûts GPU et Kubernetes",
      note: "Accès en lecture seule · rapport écrit · réponse sous 24 heures ouvrées",
      links: [
        ["Le guide complet : coûts GPU sur Kubernetes", "/cloud-costs/kubernetes-gpu"],
        ["L’étude de cas sur les coûts GPU", "/devops/gpu-cost-optimization"],
      ],
    },
    labels: {
      changes: "Ce qui change",
      breaks: "Ce qui casse ou coûte de l’argent",
      exposed: "Qui est concerné",
      check: "Une première vérification",
      fix: "Comment y remédier",
      ours: "Nous le réalisons",
      sources: "Sources",
    },
    sections: [
      {
        id: "gpu",
        ours: true,
        title: "1. Ordonnancement et coûts des GPU sur Kubernetes : arrêter de payer des GPU inactifs",
        changes: [
          "La Dynamic Resource Allocation (DRA) est stable depuis Kubernetes 1.34. C’est une alternative au device plugin, proche de ce que StorageClass et les demandes de volumes ont apporté au stockage : une DeviceClass décrit un type d’équipement, les pilotes publient ce que possède chaque nœud dans des ResourceSlices, et une application demande ce dont elle a besoin dans une ResourceClaim, avec des expressions CEL qui choisissent les équipements selon leurs attributs et leur capacité, comme la mémoire GPU. Depuis Kubernetes 1.37, un pilote DRA peut aussi servir les demandes classiques comme nvidia.com/gpu, ce qui facilite la transition.",
          "Le cœur est stable ; le partitionnement d’un GPU entre plusieurs applications via DRA ne l’est pas encore. Les partitionable devices sont en bêta depuis Kubernetes 1.36, et le pilote DRA de NVIDIA livre encore le time-slicing, MPS et le MIG dynamique comme fonctions alpha. Pendant un temps, la plupart des clusters combineront DRA avec MIG ou du time-slicing configurés de façon classique.",
        ],
        breaks: [
          "Avec le device plugin classique, un GPU est un compteur : un pod reçoit des GPU entiers ou rien. Un petit service d’inférence qui n’a besoin que de quelques gigaoctets de mémoire bloque une carte entière, et les nœuds GPU sont facturés à l’heure, que leurs cartes travaillent ou non. La métrique habituelle d’« utilisation GPU » le masque : elle indique qu’un kernel tournait, pas quelle part de la puce travaillait.",
        ],
        exposed: "Les équipes qui font de l’inférence, de l’entraînement ou des traitements GPU par lots sur Kubernetes, surtout avec de nombreux petits modèles ou un trafic qui baisse la nuit.",
        check: [
          "Si vous exportez déjà des métriques GPU, récupérez les deux dernières semaines par nœud et par pod ; sinon, commencez la collecte aujourd’hui (DCGM exporter ou les métriques de votre fournisseur).",
          "Regardez l’activité des SM et la mémoire utilisée, pas seulement l’utilisation GPU, et comparez les heures de fonctionnement de vos nœuds GPU avec les heures où leurs GPU travaillaient vraiment.",
          "Vérifiez votre version de Kubernetes et la prise en charge de DRA par votre pilote GPU : DRA demande Kubernetes 1.34 ou une version ultérieure.",
        ],
        fix: "Regrouper les charges de travail selon leur besoin réel, donner aux petits modèles une part à leur taille (MIG ou time-slicing avec le device plugin aujourd’hui, via DRA là où votre pilote le permet), passer les tâches à GPU entiers à des claims DRA, laisser l’autoscaler réduire les nœuds GPU inactifs, et comparer la facture avant et après sur la même charge.",
        sources: ["k8s-dra-ga", "k8s-dra-137", "k8s-gates", "nvidia-dra", "dcgm"],
      },
      {
        id: "identity",
        title: "2. Identité des services et des agents IA : les clés partagées ne tiennent plus",
        changes: [
          "GitGuardian a compté 28,65 millions de nouveaux secrets codés en dur sur GitHub public en 2025, soit 34 % de plus qu’en 2024, et 1,27 million de fuites liées à des services d’IA, en hausse de 81 %. Les agents IA aggravent le problème : un agent peut appeler de nombreuses API internes, et il est facile de lui donner la même clé longue durée qu’au service qui l’exécute.",
        ],
        breaks: [
          "Si cinq agents partagent une clé d’API, vous ne pouvez pas savoir lequel a fait une mauvaise modification, ni en révoquer un sans arrêter les cinq. Une clé longue durée divulguée fonctionne jusqu’à ce que quelqu’un s’en aperçoive : selon GitGuardian, 64 % des secrets valides en 2022 étaient encore exploitables en janvier 2026.",
        ],
        exposed: "Toute équipe qui fait tourner des agents IA, des pipelines CI/CD ou des microservices qui s’authentifient avec des clés statiques, des jetons dans des variables d’environnement ou des comptes de service partagés.",
        check: [
          "Comptez vos identifiants non humains (clés d’API, clés de comptes de service, jetons), et notez pour chacun les services qui l’utilisent et la date de sa dernière rotation.",
          "Repérez les identifiants partagés par plusieurs services ou agents.",
        ],
        fix: "Donner à chaque service sa propre identité vérifiable et de courte durée : l’identité de workload native du cloud quand elle existe, ou SPIFFE/SPIRE (projet diplômé de la CNCF) entre clouds et sur site. Les agents demandent alors à un intermédiaire un accès restreint et temporaire au lieu de détenir des secrets de base de données. Le groupe de travail WIMSE de l’IETF normalise les jetons d’identité de workload et leur échange entre systèmes.",
        sources: ["gitguardian", "spiffe", "wimse"],
      },
      {
        id: "pqc",
        title: "3. TLS post-quantique et certificats plus courts : l’échange de clés d’abord, les signatures ensuite",
        changes: [
          "Le NIST a publié la version finale de l’IR 8547 le 27 octobre 2026. Elle déprécie les algorithmes à clé publique classiques après 2030 et les interdit dans les normes du NIST après 2035, quelle que soit la taille de clé, pour les signatures (RSA, ECDSA, EdDSA) comme pour l’établissement de clés (ECDH, DH, RSA). Le NIST s’attend à ce que l’établissement de clés passe en premier, car un trafic enregistré aujourd’hui peut être déchiffré plus tard (« harvest now, decrypt later »).",
          "L’échange de clés bouge déjà : l’échange hybride ML-KEM (FIPS 203) est activé par défaut dans Chrome et proposé par les répartiteurs de charge des clouds. Les signatures suivent : la RFC 9881 (octobre 2025) définit ML-DSA dans les certificats X.509, et Google Cloud comme Cloudflare visent 2029 pour une migration post-quantique complète. Sur le web public, Chrome ne prévoit pas d’accepter des certificats X.509 post-quantiques ; il prépare un magasin racine distinct, résistant au quantique et fondé sur les Merkle Tree Certificates, avec des exigences pour les CA attendues au troisième trimestre 2027.",
          "L’Europe et le Royaume-Uni ont leurs propres dates : la feuille de route coordonnée de l’UE (juin 2025) demande aux États membres de commencer d’ici fin 2026 et de protéger les usages à haut risque d’ici fin 2030 ; le NCSC britannique fixe 2028 pour l’inventaire et la planification, 2031 pour les migrations prioritaires et 2035 pour la fin.",
        ],
        breaks: [
          "La taille. C’est le ClientHello hybride, plus gros, qui a cassé certains équipements réseau jusqu’ici. Les certificats viennent ensuite : dans un handshake TLS de PKI privée ou de TLS mutuel (deux certificats plus la signature du handshake), les clés publiques et signatures passent d’environ 350 octets en ECDSA P-256 à environ 10 Ko en ML-DSA-44 et 14 Ko en ML-DSA-65 (notre calcul à partir des tailles de la FIPS 204). Au-delà d’environ 14 Ko, la première réponse du serveur ne tient plus dans la fenêtre de congestion initiale de TCP et le handshake demande un aller-retour de plus ; Cloudflare a vu certains clients échouer au-delà d’environ 10 Ko.",
          "Les durées de vie. Les certificats TLS publics sont limités à 200 jours depuis le 15 mars 2026, 100 jours à partir du 15 mars 2027 et 47 jours à partir du 15 mars 2029 (scrutin SC-081v3 du CA/Browser Forum) ; les certificats publics de signature de code à 460 jours depuis le 1er mars 2026 (CSC-31). Le renouvellement manuel n’est plus une option. Une CA privée émise en 2027 pour 10 ans reste de confiance en 2037, après l’échéance de 2035 du NIST.",
        ],
        exposed: "Les entreprises avec une PKI interne, des parcs d’équipements, du TLS mutuel entre services, de l’épinglage de certificats dans des applications ou des scripts, des renouvellements encore manuels, et les fournisseurs d’administrations qui ont leurs propres échéances.",
        check: [
          "Listez chaque CA que vous opérez, avec son algorithme, sa taille de clé et sa date d’expiration.",
          "Listez les composants qui terminent ou inspectent le TLS (répartiteurs de charge, passerelles d’API, proxys, pare-feu, service mesh) et vérifiez que chacun termine un handshake avec un Chrome récent et négocie X25519MLKEM768.",
          "Repérez les certificats encore renouvelés à la main, et cherchez dans votre code et votre configuration les clés ou empreintes de certificats épinglées.",
        ],
        fix: "L’agilité cryptographique d’abord : un renouvellement automatisé partout, des certificats et des magasins de confiance dont la rotation est automatisée sans nouvelle version, des durées courtes, l’échange de clés hybride activé là où votre pile le permet, et un environnement de test qui émet des certificats ML-DSA (seuls ou à côté d’ECDSA) pour trouver les composants qui échouent avant 2030.",
        sources: ["nist", "fips203", "chrome-kem", "rfc9881", "fips204", "cf-sizes", "sc081", "cab", "chrome-mtc", "google", "cloudflare", "eu", "ncsc"],
      },
      {
        id: "cel",
        title: "4. Politiques d’admission à grande échelle : des webhooks vers CEL",
        changes: [
          "Les agents et outils d’IA peuvent envoyer beaucoup plus de changements à Kubernetes que des humains, et chaque webhook d’admission ajoute un appel réseau à chaque requête d’API concernée. Kubernetes évalue désormais les politiques dans le serveur d’API avec CEL : ValidatingAdmissionPolicy est stable depuis la 1.30 et MutatingAdmissionPolicy depuis la 1.36.",
          "Kyverno a suivi le même chemin. Ses types de politiques en CEL sont devenus stables dans Kyverno 1.17 (février 2026), qui a déprécié l’ancienne ClusterPolicy, et Kyverno 1.20 n’exécute plus les ressources ClusterPolicy, Policy et CleanupPolicy. Un cluster qui met à jour Kyverno sans migration cesse d’appliquer ces politiques.",
        ],
        breaks: [
          "Un webhook lent ou indisponible ralentit ou bloque les déploiements de tout le cluster, selon sa politique d’échec. Une mise à jour du moteur de politiques peut aussi désactiver des règles dont vous dépendez sans que personne ne le remarque.",
        ],
        exposed: "Les clusters avec plusieurs webhooks d’admission (moteurs de politiques, injection de service mesh, vérification d’images), les utilisateurs de Kyverno encore sur ClusterPolicy, et les équipes qui passent au GitOps ou à des changements pilotés par des agents.",
        check: [
          "Listez vos webhooks de validation et de mutation et leur politique d’échec (Fail ou Ignore).",
          "Si vous utilisez Kyverno, listez ses anciennes politiques (kubectl get clusterpolicy -A) et planifiez leur migration avant de passer à la 1.20.",
          "Regardez les métriques de latence d’admission du serveur d’API pendant une période de déploiements chargée.",
        ],
        fix: "Passer les règles simples en politiques CEL natives, migrer les politiques Kyverno vers ses types en CEL, garder les webhooks pour ce que CEL ne sait pas faire (recherches externes, vérification de signatures), exécuter les mêmes politiques en CI pour que les changements échouent avant d’atteindre le cluster, et tester l’admission en charge avant de s’y fier.",
        sources: ["k8s-vap", "k8s-map", "kyverno-117", "kyverno-upgrade"],
      },
      {
        id: "ebpf",
        title: "5. Sécurité à l’exécution au niveau du noyau avec eBPF : contrôler ce qui tourne dans vos conteneurs",
        changes: [
          "Une part croissante du code de vos clusters est écrite ou importée par des outils : assistants de code IA, infrastructure générée, images tierces. La sécurité à l’exécution descend dans le noyau Linux avec eBPF, qui peut observer et bloquer des appels système et des connexions réseau depuis un agent par nœud (en général un DaemonSet), avec moins de surcoût qu’une surveillance en espace utilisateur.",
        ],
        breaks: [
          "Un conteneur qui lance un processus inattendu ou ouvre une connexion sortante inattendue n’est souvent visible que dans les journaux, après coup, voire pas du tout si rien ne surveille le nœud.",
        ],
        exposed: "Les clusters multi-locataires, les plateformes qui exécutent du code client ou généré, et les applications réglementées qui doivent prouver leurs contrôles à l’exécution.",
        check: [
          "Vérifiez que BPF LSM est activé sur vos nœuds : cat /sys/kernel/security/lsm doit afficher bpf (BPF LSM est dans le noyau depuis Linux 5.7).",
          "Listez les clusters qui ont aujourd’hui une politique de sécurité à l’exécution, et si elle se contente d’alerter ou bloque aussi.",
        ],
        fix: "Commencer par l’observation (Tetragon ou Falco). Falco ne fait que détecter et alerter : appliquez donc les blocages avec Tetragon ou des politiques BPF LSM, en commençant par les règles qui ne se déclenchent jamais sur une activité légitime, un namespace à la fois et après la préproduction.",
        sources: ["linux57", "lsm", "tetragon", "falco"],
      },
      {
        id: "confidential",
        title: "6. Informatique confidentielle : protéger les données pendant leur traitement",
        changes: [
          "Le chiffrement au repos et en transit est la norme ; les données et les poids de modèles en mémoire ne sont protégés par aucun des deux. L’informatique confidentielle exécute les applications dans des environnements isolés par le matériel (AMD SEV-SNP, Intel TDX, l’informatique confidentielle NVIDIA sur les GPU récents) et permet à un service de clés de vérifier, par attestation à distance, que le code attendu s’exécute avant de libérer un secret.",
        ],
        breaks: [
          "C’est surtout un frein plutôt qu’une panne : banques, assureurs, santé et défense ne peuvent souvent pas déplacer certaines applications vers le cloud public sans elle. Son exploitation change aussi les pratiques : il faut des mesures de référence connues pour chaque image, que des builds reproductibles rendent vérifiables, et la libération des clés dépend du bon fonctionnement de l’attestation.",
        ],
        exposed: "Les secteurs réglementés, les entreprises qui hébergent des modèles propriétaires, et toute entreprise dont l’équipe conformité a refusé une migration cloud à cause des données en cours d’utilisation.",
        check: [
          "Listez les applications que votre équipe conformité ou sécurité garde aujourd’hui sur site, et pourquoi.",
          "Vérifiez quelles offres de VM ou de GPU confidentiels votre fournisseur cloud propose dans vos Régions.",
        ],
        fix: "Choisir une application, construire son image de façon reproductible en CI, l’exécuter sur des instances confidentielles, et lier la libération des clés à l’attestation. Le projet Confidential Containers (CNCF, en incubation) apporte le même modèle aux pods Kubernetes.",
        sources: ["coco"],
      },
    ],
    start: {
      title: "Par où commencer",
      paras: [
        "Lancez les six premières vérifications cette semaine (celle des GPU demande deux semaines de métriques) et notez les résultats dans un seul tableau : quel changement vous concerne, à quel point vous êtes exposé, et la date qui compte. L’ordre habituel suit l’argent, le risque et le délai : des GPU inactifs coûtent de l’argent à chaque heure, des clés partagées sont un risque dès aujourd’hui, et le post-quantique demande le plus de préparation parce que les certificats et les équipements restent en service des années.",
      ],
    },
    sources: {
      "k8s-dra-ga": ["Kubernetes v1.34 : DRA passe en GA", "https://kubernetes.io/blog/2025/09/01/kubernetes-v1-34-dra-updates/"],
      "k8s-dra-137": ["Kubernetes v1.37 : nouveautés DRA (prise en charge des extended resources en GA)", "https://kubernetes.io/blog/2026/09/03/kubernetes-v1-37-dra-updates/"],
      "k8s-gates": ["Feature gates de Kubernetes (partitionable devices DRA)", "https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/"],
      "nvidia-dra": ["Pilote DRA de NVIDIA pour les GPU : feature gates", "https://dra-driver-nvidia-gpu.sigs.k8s.io/docs/reference/feature-gates/"],
      dcgm: ["NVIDIA DCGM : métriques de profilage", "https://docs.nvidia.com/datacenter/dcgm/latest/learn/modules/profiling.html"],
      gitguardian: ["GitGuardian : The State of Secrets Sprawl 2026", "https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/"],
      spiffe: ["SPIFFE et SPIRE", "https://spiffe.io/"],
      wimse: ["Groupe de travail WIMSE de l’IETF (Workload Identity in Multi-System Environments)", "https://datatracker.ietf.org/wg/wimse/about/"],
      nist: ["NIST IR 8547 (finale, 27 oct. 2026) : Transition to Post-Quantum Cryptography Standards", "https://csrc.nist.gov/pubs/ir/8547/final"],
      fips203: ["FIPS 203 : Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM)", "https://csrc.nist.gov/pubs/fips/203/final"],
      "chrome-kem": ["Google Security Blog : l’échange de clés ML-KEM dans Chrome", "https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html"],
      rfc9881: ["RFC 9881 : identifiants d’algorithme ML-DSA pour X.509 (oct. 2025)", "https://www.rfc-editor.org/info/rfc9881"],
      fips204: ["FIPS 204 : Module-Lattice-Based Digital Signature Standard (tailles des clés et signatures)", "https://csrc.nist.gov/pubs/fips/204/final"],
      "cf-sizes": ["Cloudflare : la taille des signatures post-quantiques", "https://blog.cloudflare.com/sizing-up-post-quantum-signatures/"],
      sc081: ["CA/Browser Forum, scrutin SC-081v3 : réduction de la validité des certificats TLS", "https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/"],
      cab: ["CA/Browser Forum, scrutin CSC-31 : validité maximale de 460 jours pour la signature de code", "https://cabforum.org/2025/11/17/ballot-csc-31-maximum-validity-reduction"],
      "chrome-mtc": ["Google : un HTTPS résistant au quantique, robuste et efficace (fév. 2026)", "https://blog.google/security/cultivating-a-robust-and-efficient-quantum-safe-https/"],
      google: ["Google Cloud : feuille de route de la cryptographie post-quantique", "https://cloud.google.com/blog/products/identity-security/pqc-in-plaintext-google-clouds-post-quantum-cryptography-roadmap"],
      cloudflare: ["Cloudflare : pourquoi nous ne pouvons pas attendre de meilleurs algorithmes de signature post-quantiques", "https://blog.cloudflare.com/ml-dsa-will-have-to-do/"],
      eu: ["Commission européenne : cryptographie post-quantique et feuille de route coordonnée", "https://digital-strategy.ec.europa.eu/en/policies/post-quantum-cryptography"],
      ncsc: ["NCSC (Royaume-Uni) : calendrier de migration vers la cryptographie post-quantique", "https://www.ncsc.gov.uk/guidance/pqc-migration-timelines"],
      "k8s-vap": ["Documentation Kubernetes : Validating Admission Policy", "https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/"],
      "k8s-map": ["Documentation Kubernetes : Mutating Admission Policy", "https://kubernetes.io/docs/reference/access-authn-authz/mutating-admission-policy/"],
      "kyverno-117": ["CNCF : annonce de Kyverno 1.17", "https://www.cncf.io/blog/2026/02/18/announcing-kyverno-1-17/"],
      "kyverno-upgrade": ["Documentation Kyverno : mise à jour (1.20 et anciennes politiques)", "https://kyverno.io/docs/installation/upgrading/"],
      linux57: ["Kernel Newbies : Linux 5.7 (BPF LSM)", "https://kernelnewbies.org/Linux_5.7"],
      lsm: ["Documentation du noyau Linux : programmes LSM BPF", "https://docs.kernel.org/bpf/prog_lsm.html"],
      tetragon: ["Documentation Tetragon (application des politiques)", "https://tetragon.io/docs/"],
      falco: ["Documentation Falco (détection et alertes)", "https://falco.org/docs/"],
      coco: ["Confidential Containers (CNCF)", "https://confidentialcontainers.org/"],
    },
    articleDescription:
      "Tendances DevOps 2027–2028 : coûts GPU sur Kubernetes (DRA), identité des services, TLS post-quantique, politiques d’admission CEL, sécurité eBPF et informatique confidentielle.",
  },

  trendsFaq: {
    header: ["FAQ", "Préparer 2027–2028"],
    title: "Questions avant de planifier",
    items: [
      {
        question: "Faut-il agir sur la cryptographie post-quantique avant qu’un régulateur ne l’impose ?",
        answer: [
          "Les dates du NIST ne sont pas une loi pour les entreprises privées, mais elles orientent ce qu’attendent les éditeurs, les auditeurs et les grands clients, et l’Europe comme le Royaume-Uni ont publié leur propre calendrier. Les fournisseurs cloud fixent aussi leurs dates (Google Cloud et Cloudflare visent 2029), et Chrome prépare un magasin racine distinct, résistant au quantique, à partir de 2027. La vraie raison de commencer maintenant est le délai : les certificats et équipements déployés en 2027 seront encore en service après 2030.",
        ],
      },
      {
        question: "Peut-on utiliser DRA sur un service Kubernetes managé ?",
        answer: [
          "Il faut Kubernetes 1.34 ou une version ultérieure et un pilote DRA pour vos équipements. Les services managés activent DRA et ses nouvelles fonctions à des moments différents, et le partage des GPU via DRA est encore en bêta ou en alpha : vérifiez les notes de version de votre fournisseur et la documentation de votre pilote GPU. MIG, le time-slicing et l’autoscaling réduisent déjà les coûts GPU sans DRA.",
        ],
      },
      {
        question: "Que comprend la revue des coûts GPU et Kubernetes ?",
        answer: [
          "Nous lisons vos métriques GPU et cluster et votre facture avec un accès en lecture seule, montrons où de la capacité est payée mais inactive, et proposons les changements (redimensionnement, pools de nœuds, autoscaling, partage des GPU, claims DRA) avec l’économie attendue pour chacun. Vous recevez un rapport écrit. Si vous décidez d’avancer, nous mettons en œuvre les changements avec vous et comparons la facture avant et après.",
        ],
      },
      {
        question: "Réalisez-vous aussi les cinq autres changements ?",
        answer: [
          "Pas en tant que service aujourd’hui. PKI post-quantique, identité des services, sécurité eBPF à l’exécution, politiques d’admission et informatique confidentielle figurent dans ce guide parce qu’ils touchent les plateformes sur lesquelles nous travaillons ; les premières vérifications sont un bon point de départ pour votre équipe ou un spécialiste.",
        ],
      },
      {
        question: "Comment avez-vous vérifié les dates et les chiffres ?",
        answer: [
          "Chaque date et chiffre externe renvoie à sa source primaire dans la section qui l’utilise (NIST, IETF, CA/Browser Forum, Kubernetes, Kyverno, publications des éditeurs), vérifiée le 27 novembre 2026. Deux éléments viennent de nous : les tailles de handshake, calculées à partir des tailles de clés et de signatures de la FIPS 204, et les deux semaines de métriques GPU que nous recommandons avant tout changement.",
        ],
      },
    ],
  },
};

export default devopsTrendsFr;
