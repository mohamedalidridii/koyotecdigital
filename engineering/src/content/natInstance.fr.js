// Copy for /cloud-costs/nat-instance (NAT Gateways vs instances NAT dans les comptes hors production).
// Les chiffres ne sont pas écrits ici : le composant de l'article les calcule depuis content/cloudPrices.js.
// Mirrors natInstance.en.js key for key. Merged into fr.js.

const natInstanceFr = {
  natInstance: {
    header: ["Guide / NAT", "Comptes hors production"],
    title: "Trois NAT Gateways par compte de dev : une parité dont personne n’a besoin.",
    intro: [
      "Beaucoup de landing zones déploient le même réseau dans chaque compte : trois zones de disponibilité, trois NAT Gateways, « par parité avec la production ». En production, c’est le bon choix. Dans des comptes de dev, de recette ou de staging qui font passer quelques centaines de gigaoctets par mois, c’est surtout un coût fixe.",
      "Nous avons chiffré l’alternative, une petite instance NAT par compte, avec les prix publics AWS pour l’Europe, le Moyen-Orient et l’est des États-Unis, et noté les cas où il ne faut pas faire le changement.",
    ],
    sections: {
      today: {
        title: "Ce que paie aujourd’hui un compte hors production",
        paras: [
          "Une NAT Gateway est facturée à l’heure et au gigaoctet traité. Une NAT Gateway publique utilise aussi une Elastic IP, facturée comme toute adresse IPv4 publique. Et cela avant le moindre gigaoctet de trafic.",
        ],
        cols: ["Région", "NAT Gateway / heure", "Par Go traité", "3 gateways + 3 IPv4 publiques / mois"],
      },
      instance: {
        title: "L’alternative : une instance NAT t4g.nano",
        paras: [
          "Une instance ne paie aucun frais de traitement. Mais si une seule instance sert trois zones, le trafic des deux autres zones traverse une frontière de zone, facturée 0,01 $ par Go dans chaque sens : environ 0,0133 $ par Go en moyenne, contre 0,045 $ à 0,0528 $ par Go sur une NAT Gateway. La sortie vers Internet coûte la même chose dans les deux cas.",
        ],
        cols: ["Région", "t4g.nano / heure", "Instance + 8 Go gp3 + 1 IPv4 publique / mois"],
      },
      example: {
        title: "Un exemple chiffré : {region}, {gb} Go par mois",
        cols: ["", "NAT Gateways ({zones} zones)", "Une instance NAT"],
        rows: { hours: "Frais horaires", ipv4: "IPv4 publique", disk: "Disque", traffic: "Trafic", total: "Total par mois" },
        na: "n/a",
        result: "Soit {month} d’économie par mois, ou {year} par an, pour un seul compte.",
      },
      accounts: {
        title: "Sur plusieurs comptes",
        paras: ["Mêmes hypothèses : {zones} zones et {gb} Go par mois et par compte, avec à chaque fois la configuration d’instance NAT la moins chère."],
        colAccounts: "Comptes hors production",
        perYear: "par an",
        note: "En US East (Virginie du Nord), la moins chère des cinq Régions, 10 comptes économisent encore {us} par an.",
      },
      fit: {
        title: "Est-ce pour vous ?",
        questions: [
          "Avez-vous plus de trois comptes AWS hors production avec leurs propres NAT Gateways ?",
          "Chacun fait-il passer moins d’environ 1 To par mois par la NAT ?",
          "Quelqu’un dans l’équipe peut-il prendre en charge un petit module Terraform et ses mises à jour ?",
        ],
        paras: [
          "Trois oui : l’économie est réelle. Avec un ou deux comptes, c’est environ 1 500 $ par an chacun, ce qui justifie rarement de gérer votre propre équipement réseau.",
        ],
      },
      setup: {
        title: "Comment le mettre en place",
        items: [
          "Utiliser une image NAT maintenue (le projet open source fck-nat publie des images ARM pour t4g), ou Amazon Linux 2023 avec le forwarding IP et une règle de masquerading iptables ou nftables.",
          "Désactiver le contrôle source/destination de l’instance.",
          "La faire tourner dans un groupe Auto Scaling d’une instance, avec une interface réseau et une Elastic IP fixes que l’instance rattache au démarrage, pour que les tables de routage privées (0.0.0.0/0 vers cette interface) restent valides après un remplacement.",
          "La garder dans le même module Terraform ou CDK que la version NAT Gateway, qui reste la variante de production.",
          "Après le changement, vérifier dans Cost Explorer que les types d’usage NatGateway-Hours et NatGateway-Bytes tombent à zéro dans ces comptes.",
        ],
      },
      gotchas: {
        title: "Les pièges",
        items: [
          "Bande passante : une t4g.nano a 0,032 Gbit/s de bande passante réseau de base et monte à 5 Gbit/s en rafale. 500 Go par mois, c’est environ 1,5 Mbit/s en moyenne : le trafic de dev passe, mais les gros téléchargements d’images ou de données consomment les crédits de rafale et ralentissent quand ils sont épuisés. Une t4g.micro double la bande passante de base pour environ 3 $ de plus par mois.",
          "Mémoire : 0,5 Gio suffit pour la NAT, pas pour autre chose sur la même machine.",
          "Bascule : quand l’instance est remplacée, les connexions ouvertes tombent et la sortie s’arrête quelques minutes. Acceptable en dev, pas en production.",
          "Mises à jour : c’est un serveur à vous. À patcher, surveiller et alerter.",
          "Trafic inter-zones : au-delà d’environ 1,2 To par mois et par compte, une instance par zone revient moins cher que les frais inter-zones. Le calculateur ci-dessous retient la configuration la moins chère.",
          "S3 et DynamoDB : ajoutez quand même des gateway endpoints, ce trafic ne doit passer par aucune NAT.",
          "NAT Gateway régionale : le nouveau mode régional reste facturé à l’heure dans chaque zone où il est actif, il ne change donc pas cette comparaison.",
          "Production : gardez-y les NAT Gateways managées.",
        ],
      },
    },
    calcTitle: "Testez avec vos chiffres",
    backLabel: "Tous les scénarios de coûts AWS",
    articleDescription:
      "Ce que coûtent trois NAT Gateways dans chaque compte AWS hors production, ce que coûte une instance NAT t4g.nano à la place, et quand ne pas changer, pour cinq Régions.",
  },

  natFaq: {
    header: ["FAQ / 04", "Instances NAT"],
    title: "Les questions avant de changer",
    items: [
      {
        question: "Une instance NAT, c’est sûr en production ?",
        answer: [
          "Nous ne le recommandons pas. Une NAT Gateway managée monte en charge seule, est redondante dans sa zone et ne demande aucune mise à jour. L’économie vaut la peine dans les comptes hors production, où quelques minutes d’interruption pendant un remplacement sont acceptables.",
        ],
      },
      {
        question: "Et la nouvelle NAT Gateway régionale ?",
        answer: [
          "Elle simplifie l’architecture (une seule gateway sur plusieurs zones), mais AWS la facture toujours à l’heure dans chaque zone où elle est active, plus le Go traité. Pour cette comparaison, le coût est le même que trois gateways zonales.",
        ],
      },
      {
        question: "Pourquoi compter l’adresse IPv4 publique ?",
        answer: [
          "Depuis février 2024, AWS facture chaque adresse IPv4 publique 0,005 $ de l’heure, y compris les Elastic IP des NAT Gateways publiques. Trois gateways, c’est trois adresses, environ 11 $ par mois.",
        ],
      },
      {
        question: "Peut-on se passer complètement de NAT ?",
        answer: [
          "Parfois. Les gateway endpoints retirent le trafic S3 et DynamoDB, les interface endpoints couvrent d’autres services AWS, et des sous-réseaux IPv6 seulement avec un egress-only internet gateway fonctionnent pour les destinations compatibles IPv6. Beaucoup de services publics sont encore IPv4 seulement, donc la plupart des comptes gardent une forme de NAT.",
        ],
      },
      {
        question: "Pouvez-vous le faire dans nos comptes ?",
        answer: [
          "Oui. C’est l’un des contrôles de notre audit de coûts AWS en deux semaines : nous mesurons d’abord le trafic NAT de chaque compte, puis livrons le changement Terraform que vous pouvez relire.",
        ],
      },
    ],
  },
};

export default natInstanceFr;
