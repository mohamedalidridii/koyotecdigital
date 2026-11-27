// Texte français de /cloud-costs/kubernetes-gpu : le guide de référence sur les coûts GPU dans Kubernetes
// (mesurer, partager, réduire) et la revue des coûts GPU et Kubernetes qu’il propose. Chaque affirmation
// technique a sa source primaire dans `sources` (vérifiées le 27 novembre 2026). Le calculateur ne fait que
// des calculs sur les chiffres saisis par le lecteur. Miroir de gpuCosts.en.js, clé pour clé.

const gpuCostsFr = {
  gpuCosts: {
    header: ["Guide / coûts GPU", "{n} sources primaires"],
    audience: "DevOps · pour les équipes qui font tourner des GPU sur Kubernetes",
    title: "La plupart des clusters GPU sous Kubernetes paient des GPU entiers et n’en utilisent qu’une fraction.",
    byline: { by: "Par", name: "Mohamed Ali Dridi", role: "fondateur de KOYOTEC Engineering", checked: "Informations vérifiées le 27 novembre 2026" },
    intro: [
      "Un nœud GPU coûte le même prix à l’heure, que ses cartes travaillent ou non. Dans Kubernetes, la façon habituelle de demander des GPU (des cartes entières, comptées comme des entiers) et la façon habituelle de les surveiller (un taux d’utilisation qui indique seulement qu’un kernel tournait) rendent la capacité inactive facile à payer et difficile à voir.",
      "Ce guide explique comment la mesurer, les quatre façons de partager un GPU et leurs limites, ce que DRA change par rapport au device plugin, et comment éteindre les nœuds GPU quand rien ne tourne.",
    ],
    labels: { sources: "Sources" },
    why: {
      title: "Pourquoi les factures GPU grimpent sur Kubernetes",
      items: [
        "Des GPU entiers par pod. Avec le device plugin, un pod demande nvidia.com/gpu: 1 et reçoit une carte entière, même si son modèle n’a besoin que de quelques gigaoctets de sa mémoire.",
        "Des réplicas « par prudence ». Chaque réplica d’un service d’inférence garde son propre GPU, dimensionné pour le pic de trafic toute la journée.",
        "Des nœuds qui ne s’arrêtent jamais. Les pools de nœuds GPU gardent souvent leur taille minimale la nuit et le week-end, quand le trafic n’est qu’une fraction de celui de la journée.",
        "Une métrique qui le masque. L’utilisation GPU (DCGM_FI_DEV_GPU_UTIL, le chiffre qu’affiche nvidia-smi) indique à quelle fréquence un kernel tournait, pas quelle part de la puce travaillait : un GPU peut afficher 100 % alors que la plupart de ses multiprocesseurs (SM) attendent.",
      ],
      sources: ["dcgm"],
    },
    measure: {
      title: "Mesurer d’abord : trois chiffres par GPU",
      cols: ["Métrique", "Ce qu’elle indique", "À surveiller"],
      rows: [
        ["Activité des SM (DCGM_FI_PROF_SM_ACTIVE)", "La part du temps où les multiprocesseurs du GPU avaient du travail", "Des valeurs basses sur des GPU qui semblent occupés dans nvidia-smi"],
        ["Mémoire utilisée (DCGM_FI_DEV_FB_USED)", "La quantité de mémoire dont chaque application a vraiment besoin", "Des modèles qui utilisent une petite part d’une grande carte : candidats à MIG"],
        ["Heures GPU et heures actives", "Les heures de fonctionnement de vos nœuds GPU, comparées aux heures de vrai travail de leurs GPU", "Des nœuds allumés la nuit et le week-end avec peu d’activité"],
      ],
      paras: [
        "Collectez-les pendant deux semaines, par nœud et par pod, avec le DCGM exporter ou les métriques GPU de votre fournisseur, avant de changer quoi que ce soit. Une fois les GPU partagés, vérifiez que votre exporter attribue encore les métriques à chaque pod : NVIDIA documente des limites pour le time-slicing et MPS.",
      ],
      sources: ["dcgm", "gpu-sharing"],
    },
    calc: {
      title: "Ce que vous coûtent les GPU inactifs",
      inputs: "Vos chiffres",
      fields: {
        gpus: "GPU en service",
        price: "Prix par heure de GPU (USD)",
        hours: "Heures de fonctionnement par jour",
        activity: "Activité moyenne des SM (%)",
        target: "Activité visée après regroupement (%)",
      },
      priceNote: "Utilisez votre propre prix : à la demande, réservé ou engagé. Les valeurs par défaut ne sont qu’un exemple.",
      spend: "Dépense GPU",
      idle: "dont paie de la capacité inactive",
      needed: "GPU nécessaires à l’activité visée",
      saving: "Économie possible",
      perMonth: "/ mois",
      perYear: "par an",
      note: "Une estimation à partir de vos chiffres, pas une promesse : le regroupement réel est limité par la mémoire, les objectifs de latence et le temps de chargement de vos modèles. La revue le mesure sur votre cluster.",
      cta: "Demander une revue des coûts GPU et Kubernetes",
    },
    share: {
      title: "Quatre façons de partager un GPU",
      cols: ["Méthode", "Isolation", "Idéal pour", "Limites et maturité"],
      rows: [
        ["MIG (Multi-Instance GPU)", "Matérielle : mémoire et calcul sont séparés", "Les modèles de production qui ont besoin d’une part garantie", "GPU de datacenter NVIDIA à partir de la génération Ampere ; jusqu’à 7 instances sur A100, H100 et plus récents, 4 sur A30 ; profils fixes"],
        ["Time-slicing", "Aucune : ni isolation mémoire ni isolation des pannes entre les applications", "Le développement, les notebooks, les traitements par lots", "Une application peut prendre toute la mémoire ou faire planter ses voisines"],
        ["MPS (Multi-Process Service)", "Partielle : les processus tournent en même temps sur le GPU", "De nombreux petits processus d’inférence", "Expérimental dans le device plugin de NVIDIA ; limites sur les demandes multi-GPU et les métriques par pod"],
        ["DRA (Dynamic Resource Allocation)", "Dépend du pilote et de l’équipement", "Choisir les équipements par attributs et capacité ; tâches à GPU entiers", "Cœur stable depuis Kubernetes 1.34 ; partitionable devices en bêta depuis la 1.36 ; fonctions de partage du pilote DRA de NVIDIA encore en alpha"],
      ],
      paras: [
        "MIG et le time-slicing se combinent : le time-slicing au-dessus d’instances MIG partage encore chaque partition. En pratique, l’inférence de production va sur MIG, le développement et les traitements par lots sur le time-slicing.",
      ],
      sources: ["mig", "gpu-sharing", "device-plugin", "k8s-gates", "nvidia-dra"],
    },
    dra: {
      title: "DRA ou device plugin",
      items: [
        "Compter ou réclamer. Le device plugin annonce un nombre (nvidia.com/gpu: 4). DRA publie chaque équipement avec ses attributs et sa capacité dans des ResourceSlices, et un pod demande ce dont il a besoin dans une ResourceClaim.",
        "Choisir les équipements. Une DeviceClass et des expressions CEL peuvent exiger, par exemple, un GPU avec assez de mémoire ou un modèle précis, au lieu d’orienter les pods avec des labels et des taints de nœuds.",
        "Partager. Plusieurs pods peuvent partager une même ResourceClaim, et les partitionable devices (en bêta depuis Kubernetes 1.36) permettent de découper un GPU à la demande. Avec le pilote DRA de NVIDIA, le time-slicing, MPS et le MIG dynamique sont encore des fonctions alpha.",
        "Migrer. Depuis Kubernetes 1.37, un pilote DRA peut servir les demandes d’extended resources classiques comme nvidia.com/gpu : les applications existantes gardent leurs manifestes pendant que le cluster passe à DRA.",
      ],
      sources: ["k8s-dra-docs", "k8s-dra-ga", "k8s-dra-137"],
    },
    scale: {
      title: "Éteindre les nœuds GPU quand rien ne tourne",
      items: [
        "Placez les applications GPU sur leurs propres pools de nœuds, avec un taint pour que les pods CPU n’y atterrissent pas et ne les gardent pas éveillés.",
        "Laissez l’autoscaler (Cluster Autoscaler ou Karpenter) retirer les nœuds GPU inactifs, et baissez le minimum en dehors des heures de bureau là où la latence le permet.",
        "Mesurez le temps qu’il faut à un modèle pour être prêt sur un nouveau nœud (téléchargement de l’image et chargement des poids) : c’est lui qui fixe jusqu’où le minimum peut descendre pour les services sensibles à la latence.",
        "Déplacez le fine-tuning et les traitements par lots vers les heures où le trafic d’inférence est bas, pour qu’ils réutilisent la capacité au lieu d’ajouter des nœuds.",
      ],
    },
    offer: {
      kicker: "Ce que nous faisons pour vous",
      title: "Une revue des coûts GPU et Kubernetes, puis les changements si vous le souhaitez.",
      text: "Avec un accès en lecture seule à vos métriques et à votre facture, nous mesurons l’activité réelle de vos GPU et de vos nœuds, montrons ce que vous payez pour de la capacité inactive, et vous remettons un plan chiffré : redimensionnement, autoscaling, partage des GPU avec MIG ou time-slicing, et DRA là où vos versions et vos pilotes le permettent. Vous recevez un rapport écrit avec l’économie attendue pour chaque changement. Si vous décidez d’avancer, nous le mettons en œuvre avec vous et comparons la facture avant et après.",
      cta: "Demander une revue des coûts GPU et Kubernetes",
      note: "Accès en lecture seule · rapport écrit · réponse sous 24 heures ouvrées",
      links: [
        ["L’étude de cas sur les coûts GPU", "/devops/gpu-cost-optimization"],
        ["Tendances DevOps 2027–2028", "/devops-trends-2027"],
      ],
    },
    sources: {
      dcgm: ["NVIDIA DCGM : métriques de profilage", "https://docs.nvidia.com/datacenter/dcgm/latest/learn/modules/profiling.html"],
      "gpu-sharing": ["NVIDIA GPU Operator : time-slicing des GPU dans Kubernetes", "https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-sharing.html"],
      mig: ["Guide utilisateur MIG de NVIDIA : GPU pris en charge", "https://docs.nvidia.com/datacenter/tesla/mig-user-guide/latest/supported-gpus.html"],
      "device-plugin": ["Device plugin NVIDIA pour Kubernetes", "https://github.com/NVIDIA/k8s-device-plugin"],
      "k8s-gates": ["Feature gates de Kubernetes (partitionable devices DRA)", "https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/"],
      "nvidia-dra": ["Pilote DRA de NVIDIA pour les GPU : feature gates", "https://dra-driver-nvidia-gpu.sigs.k8s.io/docs/reference/feature-gates/"],
      "k8s-dra-docs": ["Documentation Kubernetes : Dynamic Resource Allocation", "https://kubernetes.io/docs/concepts/resource-management/dynamic-resource-allocation/"],
      "k8s-dra-ga": ["Kubernetes v1.34 : DRA passe en GA", "https://kubernetes.io/blog/2025/09/01/kubernetes-v1-34-dra-updates/"],
      "k8s-dra-137": ["Kubernetes v1.37 : nouveautés DRA (prise en charge des extended resources en GA)", "https://kubernetes.io/blog/2026/09/03/kubernetes-v1-37-dra-updates/"],
    },
    articleDescription:
      "Réduire les coûts GPU sur Kubernetes : mesurer les GPU inactifs avec DCGM, les partager avec MIG, le time-slicing ou DRA, et éteindre les nœuds GPU, avec un calculateur.",
  },

  gpuFaq: {
    header: ["FAQ", "Coûts GPU"],
    title: "Questions avant de changer quoi que ce soit",
    items: [
      {
        question: "Quels GPU prennent en charge MIG ?",
        answer: [
          "Les GPU de datacenter NVIDIA à partir de la génération Ampere (compute capability 8.0 et plus), comme les A100, H100, H200 et les puces Blackwell, avec jusqu’à sept instances ; l’A30 en accepte quatre. Vérifiez votre modèle exact et ses profils dans le guide utilisateur MIG de NVIDIA.",
        ],
      },
      {
        question: "Le time-slicing est-il sûr en production ?",
        answer: [
          "Il n’offre ni isolation mémoire ni isolation des pannes entre les applications qui partagent un GPU : l’une d’elles peut prendre toute la mémoire ou faire planter les autres. Il convient au développement, aux notebooks et aux traitements par lots ; les modèles de production qui ont besoin d’une part garantie sont mieux sur MIG.",
        ],
      },
      {
        question: "Faut-il DRA pour réduire les coûts GPU ?",
        answer: [
          "Non. Mesurer, redimensionner, utiliser MIG ou le time-slicing et réduire les nœuds inactifs fonctionnent aujourd’hui avec le device plugin. DRA rend le choix des équipements déclaratif, et facilitera le partage à mesure que ses fonctions mûrissent.",
        ],
      },
      {
        question: "Pourquoi nvidia-smi affiche-t-il 100 % alors que le GPU est surtout inactif ?",
        answer: [
          "Son taux d’utilisation mesure à quelle fréquence un kernel tournait pendant la période d’échantillonnage, pas quelle part de la puce était utilisée. L’activité des SM (DCGM_FI_PROF_SM_ACTIVE) et la mémoire utilisée donnent une image plus juste de ce dont une application a besoin.",
        ],
      },
      {
        question: "Que comprend la revue des coûts GPU et Kubernetes ?",
        answer: [
          "Nous lisons vos métriques GPU et cluster et votre facture avec un accès en lecture seule, montrons où de la capacité est payée mais inactive, et proposons les changements (redimensionnement, pools de nœuds, autoscaling, partage des GPU, claims DRA) avec l’économie attendue pour chacun. Vous recevez un rapport écrit. Si vous décidez d’avancer, nous mettons en œuvre les changements avec vous et comparons la facture avant et après.",
        ],
      },
    ],
  },
};

export default gpuCostsFr;
