// Texts of the "Cloud costs" scenarios page. Prices live in cloudPrices.js.
export const CLOUD_COSTS = {
  en: {
    kicker: "Cloud cost scenarios",
    regionLabel: "AWS Region",
    regionNote: "Prices change with the Region: our clients run in Paris, Frankfurt, the UAE and Bahrain.",
    perMonth: "/ month",
    perYear: "/ year",
    before: "Default configuration",
    after: "Optimised architecture",
    savings: "Estimated savings",
    tradeoffs: "Trade-offs to plan for",
    howTo: "How we implement it",
    inputs: "Your figures",
    priceUsed: "Price used",
    disclaimer:
      "AWS public list prices in USD, excluding tax, Free Tier and negotiated discounts (Savings Plans, EDP), checked on {date} in the AWS Price List and pricing pages. Spot: lowest price in the Region published by AWS that day; it changes by Availability Zone and over time. Illustrative scenarios, not a client system.",
    sourcesTitle: "Sources",
    ctaTitle: "What is your bill hiding?",
    ctaCopy: "In two weeks, we audit your AWS account (network, compute, storage, data) and hand you a prioritised list of savings with the effort each one takes.",
    ctaAudit: "Request a cloud cost audit",
    ctaTalk: "Talk to an engineer",
    scenarios: [
      {
        id: "s3-nat",
        title: "S3 traffic going through a NAT Gateway",
        problem:
          "Workloads in private subnets read large volumes from Amazon S3: a data lake, model training, log processing. By default that traffic leaves through the NAT Gateway, which bills every gigabyte it processes.",
        default: "Private subnet → NAT Gateway → S3. Every GB pays the NAT Gateway data processing fee.",
        optimised: "An S3 gateway VPC endpoint and one route in the subnet route tables: S3 traffic goes straight to S3 inside the Region. AWS charges nothing extra for gateway endpoints.",
        how: [
          "Create the S3 gateway endpoint (Terraform) and associate it with the private route tables.",
          "Switch bucket policies that rely on aws:SourceIp to aws:SourceVpce.",
          "Check in Cost Explorer / CUR that NatGateway-Bytes drops.",
        ],
        tradeoffs: [
          "Works for S3 and DynamoDB in the same Region only.",
          "Interface endpoints (PrivateLink) are a different product: billed per hour and per GB.",
          "The NAT Gateway hourly fee remains if other traffic still needs it.",
        ],
        fields: { gb: "Data read from S3 through the NAT Gateway (GB / month)" },
      },
      {
        id: "cross-az",
        title: "Microservices talking across Availability Zones",
        problem:
          "In a Kubernetes (EKS) cluster spread over several Availability Zones, services call each other without regard to zone. AWS bills traffic between instances in different zones $0.01 per GB in each direction, so $0.02 per GB for a call that crosses.",
        default: "Pods spread evenly over N zones: about (N−1)/N of internal calls cross a zone.",
        optimised: "Kubernetes Services with trafficDistribution: PreferSameZone (or Istio locality load balancing) keep calls in the caller's zone whenever a healthy endpoint exists there.",
        how: [
          "Measure cross-zone traffic first (VPC Flow Logs or the CUR line DataTransfer-Regional-Bytes).",
          "Enable PreferSameZone on the chattiest Services and spread replicas per zone (topology spread constraints).",
          "Keep cluster-wide fallback: if a zone has no healthy endpoint, traffic goes elsewhere.",
        ],
        tradeoffs: [
          "Each zone needs enough replicas, otherwise load becomes uneven.",
          "Not every call can stay local; the share depends on your traffic.",
          "AWS App Mesh reached end of support on 30 September 2026: do not start new designs on it.",
        ],
        fields: { gb: "Internal service-to-service traffic (GB / month)", zones: "Availability Zones", local: "Share kept in the same zone after the change (%)" },
      },
      {
        id: "spot-ebs",
        title: "Stateful batch jobs kept on On-Demand",
        problem:
          "CI runners or batch jobs of several hours keep state on disk, so teams avoid Spot Instances, which can be interrupted with a two-minute notice, and pay On-Demand prices around the clock.",
        default: "A fleet of m5.2xlarge On-Demand instances (Linux), running all month.",
        optimised: "The same fleet on Spot, with state on EBS or checkpoints on S3. On the two-minute Spot interruption notice, an EventBridge rule triggers automation that saves the job, moves the volume to a replacement instance and resumes.",
        how: [
          "Checkpoint jobs (or keep their working directory on EBS).",
          "EventBridge rule on EC2 Spot Instance Interruption Warning → Lambda / Step Functions to drain, detach and re-attach.",
          "Several instance types (m5, m6i, m7i) and an On-Demand fallback in the Auto Scaling group.",
        ],
        tradeoffs: [
          "An EBS volume lives in one Availability Zone: the replacement instance must be in the same zone (or use S3 checkpoints to move across zones).",
          "Spot prices change by zone and over time, and capacity is not guaranteed.",
          "Short jobs without state are simpler: just retry them.",
        ],
        fields: { instances: "Number of instances", hours: "Hours per month", spot: "Share of hours on Spot (%)" },
      },
      {
        id: "dynamodb",
        title: "A DynamoDB table with a hot partition key",
        problem:
          "A leaderboard or ad-tech table writes thousands of items per second under one key per day (for example 2026-11-18). A single DynamoDB partition accepts at most 1,000 write units per second: past that, writes are throttled whatever the capacity you pay for. Raising provisioned capacity costs more and does not fix the hot key.",
        default: "One partition key per day, and capacity over-provisioned to try to absorb the throttling.",
        optimised: "Write sharding: a suffix 0…N−1 added to the key spreads writes over at least peak ÷ 1,000 partitions, and you provision only the capacity you need (or use on-demand mode).",
        how: [
          "Choose N with headroom (often 2× the minimum) and a random or hash-based suffix.",
          "Read by querying the N shards in parallel, or maintain a periodic rollup.",
          "Watch WriteThrottleEvents and the CloudWatch Contributor Insights hot keys.",
        ],
        tradeoffs: [
          "Reads become N queries (or a rollup to maintain).",
          "One write unit covers an item up to 1 KB: larger items consume more.",
          "Without sharding, more than 1,000 writes per second on one key is not possible.",
        ],
        fields: { writes: "Peak writes per second", size: "Item size (KB)", factor: "Over-provisioning factor in the default setup (×)", hours: "Hours per month at that capacity" },
        shardsLabel: "Minimum shards needed",
      },
    ],
  },
  fr: {
    kicker: "Scénarios de coûts cloud",
    regionLabel: "Région AWS",
    regionNote: "Les prix changent selon la Région : nos clients sont à Paris, Francfort, aux Émirats et à Bahreïn.",
    perMonth: "/ mois",
    perYear: "/ an",
    before: "Configuration par défaut",
    after: "Architecture optimisée",
    savings: "Économie estimée",
    tradeoffs: "Compromis à prévoir",
    howTo: "Comment nous le mettons en place",
    inputs: "Vos chiffres",
    priceUsed: "Prix utilisé",
    disclaimer:
      "Prix publics AWS en USD, hors taxes, Free Tier et remises négociées (Savings Plans, EDP), vérifiés le {date} dans l'AWS Price List et les pages de tarifs AWS. Spot : prix le plus bas publié par AWS dans la Région ce jour-là ; il varie selon la zone de disponibilité et dans le temps. Scénarios illustratifs, pas le système d'un client.",
    sourcesTitle: "Sources",
    ctaTitle: "Que cache votre facture ?",
    ctaCopy: "En deux semaines, nous auditons votre compte AWS (réseau, calcul, stockage, données) et vous remettons une liste priorisée d'économies, avec l'effort que chacune demande.",
    ctaAudit: "Demander un audit des coûts cloud",
    ctaTalk: "Parler à un ingénieur",
    scenarios: [
      {
        id: "s3-nat",
        title: "Le trafic S3 qui passe par une NAT Gateway",
        problem:
          "Des charges de travail en sous-réseau privé lisent de gros volumes sur Amazon S3 : data lake, entraînement de modèles, traitement de logs. Par défaut, ce trafic sort par la NAT Gateway, qui facture chaque gigaoctet traité.",
        default: "Sous-réseau privé → NAT Gateway → S3. Chaque Go paie les frais de traitement de la NAT Gateway.",
        optimised: "Un VPC endpoint de type gateway pour S3 et une route dans les tables de routage privées : le trafic S3 va directement à S3 dans la Région. AWS ne facture rien de plus pour les gateway endpoints.",
        how: [
          "Créer le gateway endpoint S3 (Terraform) et l'associer aux tables de routage privées.",
          "Remplacer dans les bucket policies les conditions aws:SourceIp par aws:SourceVpce.",
          "Vérifier dans Cost Explorer / CUR la baisse de NatGateway-Bytes.",
        ],
        tradeoffs: [
          "Fonctionne pour S3 et DynamoDB, dans la même Région uniquement.",
          "Les interface endpoints (PrivateLink) sont un autre produit, facturé à l'heure et au Go.",
          "Les frais horaires de la NAT Gateway restent si d'autres flux en ont besoin.",
        ],
        fields: { gb: "Données lues sur S3 via la NAT Gateway (Go / mois)" },
      },
      {
        id: "cross-az",
        title: "Des microservices qui discutent entre zones de disponibilité",
        problem:
          "Dans un cluster Kubernetes (EKS) réparti sur plusieurs zones de disponibilité, les services s'appellent sans tenir compte de la zone. AWS facture le trafic entre instances de zones différentes 0,01 $ par Go dans chaque sens, soit 0,02 $ par Go pour un appel qui traverse.",
        default: "Pods répartis uniformément sur N zones : environ (N−1)/N des appels internes changent de zone.",
        optimised: "Des Services Kubernetes avec trafficDistribution: PreferSameZone (ou le load balancing par localité d'Istio) gardent les appels dans la zone de l'appelant dès qu'un endpoint sain y existe.",
        how: [
          "Mesurer d'abord le trafic inter-zones (VPC Flow Logs ou la ligne DataTransfer-Regional-Bytes du CUR).",
          "Activer PreferSameZone sur les Services les plus bavards et répartir les réplicas par zone (topology spread constraints).",
          "Garder le repli : si une zone n'a pas d'endpoint sain, le trafic part ailleurs.",
        ],
        tradeoffs: [
          "Chaque zone doit avoir assez de réplicas, sinon la charge devient inégale.",
          "Tous les appels ne peuvent pas rester locaux : la part dépend de votre trafic.",
          "AWS App Mesh n'est plus supporté depuis le 30 septembre 2026 : ne pas démarrer de nouvelle architecture dessus.",
        ],
        fields: { gb: "Trafic interne entre services (Go / mois)", zones: "Zones de disponibilité", local: "Part qui reste dans la même zone après le changement (%)" },
      },
      {
        id: "spot-ebs",
        title: "Des traitements batch avec état laissés en On-Demand",
        problem:
          "Des runners CI ou des traitements batch de plusieurs heures gardent un état sur disque : les équipes évitent alors les instances Spot, qui peuvent être interrompues avec un préavis de deux minutes, et paient le prix On-Demand en continu.",
        default: "Une flotte d'instances m5.2xlarge On-Demand (Linux), allumées tout le mois.",
        optimised: "La même flotte en Spot, avec l'état sur EBS ou des checkpoints sur S3. Au préavis d'interruption Spot de deux minutes, une règle EventBridge déclenche une automatisation qui sauvegarde le travail, déplace le volume vers une instance de remplacement et reprend.",
        how: [
          "Prévoir des checkpoints (ou garder le répertoire de travail sur EBS).",
          "Règle EventBridge sur EC2 Spot Instance Interruption Warning → Lambda / Step Functions pour vider, détacher et rattacher.",
          "Plusieurs types d'instances (m5, m6i, m7i) et un repli On-Demand dans le groupe Auto Scaling.",
        ],
        tradeoffs: [
          "Un volume EBS vit dans une seule zone : l'instance de remplacement doit être dans la même zone (ou utiliser des checkpoints S3 pour changer de zone).",
          "Les prix Spot varient selon la zone et dans le temps, et la capacité n'est pas garantie.",
          "Pour des tâches courtes sans état, plus simple : les relancer.",
        ],
        fields: { instances: "Nombre d'instances", hours: "Heures par mois", spot: "Part des heures en Spot (%)" },
      },
      {
        id: "dynamodb",
        title: "Une table DynamoDB avec une clé de partition « chaude »",
        problem:
          "Une table de classement ou d'ad-tech écrit des milliers d'éléments par seconde sous une seule clé par jour (par exemple 2026-11-18). Une partition DynamoDB accepte au maximum 1 000 unités d'écriture par seconde : au-delà, les écritures sont limitées (throttling) quelle que soit la capacité payée. Augmenter la capacité provisionnée coûte plus cher et ne règle pas la clé chaude.",
        default: "Une clé de partition par jour, et une capacité surdimensionnée pour tenter d'absorber le throttling.",
        optimised: "Le write sharding : un suffixe 0…N−1 ajouté à la clé répartit les écritures sur au moins pic ÷ 1 000 partitions, et l'on provisionne uniquement la capacité nécessaire (ou le mode à la demande).",
        how: [
          "Choisir N avec de la marge (souvent 2× le minimum) et un suffixe aléatoire ou calculé (hash).",
          "Lire en interrogeant les N shards en parallèle, ou maintenir un agrégat périodique.",
          "Surveiller WriteThrottleEvents et les clés chaudes avec CloudWatch Contributor Insights.",
        ],
        tradeoffs: [
          "Les lectures deviennent N requêtes (ou un agrégat à maintenir).",
          "Une unité d'écriture couvre un élément jusqu'à 1 Ko : les éléments plus gros en consomment plus.",
          "Sans sharding, plus de 1 000 écritures par seconde sur une même clé est impossible.",
        ],
        fields: { writes: "Pic d'écritures par seconde", size: "Taille d'un élément (Ko)", factor: "Facteur de surdimensionnement par défaut (×)", hours: "Heures par mois à cette capacité" },
        shardsLabel: "Nombre minimum de shards",
      },
    ],
  },
};
