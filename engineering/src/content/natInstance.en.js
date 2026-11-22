// English copy for /cloud-costs/nat-instance (NAT Gateways vs NAT instances in non-production accounts).
// Figures are not written here: the article component computes them from content/cloudPrices.js.
// Mirrors natInstance.fr.js key for key. Merged into en.js.

const natInstanceEn = {
  natInstance: {
    header: ["Guide / NAT", "Non-production accounts"],
    title: "Three NAT Gateways per dev account is parity nobody needs.",
    intro: [
      "Many landing zones deploy the same network in every account: three Availability Zones, three NAT Gateways, \"for parity with production\". In production that is the right call. In dev, QA and staging accounts that move a few hundred gigabytes a month, it is mostly a fixed fee.",
      "We priced the alternative, a single small NAT instance per account, with AWS list prices for Europe, the Middle East and US East, and wrote down when you should not make the switch.",
    ],
    sections: {
      today: {
        title: "What one non-production account pays today",
        paras: [
          "A NAT Gateway is billed per hour and per gigabyte it processes. A public NAT Gateway also uses an Elastic IP, billed like any public IPv4 address. That is before a single gigabyte moves.",
        ],
        cols: ["Region", "NAT Gateway / hour", "Per GB processed", "3 gateways + 3 public IPv4 / month"],
      },
      instance: {
        title: "The alternative: one t4g.nano NAT instance",
        paras: [
          "There is no data processing fee on an instance. But if one instance serves three zones, traffic from the other two zones crosses an Availability Zone boundary, billed $0.01 per GB in each direction: about $0.0133 per GB on average, against $0.045 to $0.0528 per GB on a NAT Gateway. Internet egress costs the same in both setups.",
        ],
        cols: ["Region", "t4g.nano / hour", "Instance + 8 GB gp3 + 1 public IPv4 / month"],
      },
      example: {
        title: "A worked example: {region}, {gb} GB a month",
        cols: ["", "NAT Gateways ({zones} zones)", "One NAT instance"],
        rows: { hours: "Hourly fees", ipv4: "Public IPv4", disk: "Disk", traffic: "Traffic", total: "Total per month" },
        na: "n/a",
        result: "That is {month} a month saved, or {year} a year, for one account.",
      },
      accounts: {
        title: "Across accounts",
        paras: ["Same assumptions: {zones} zones and {gb} GB a month per account, the cheaper NAT instance setup in each case."],
        colAccounts: "Non-production accounts",
        perYear: "per year",
        note: "In US East (N. Virginia), the cheapest of the five Regions, 10 accounts still save {us} a year.",
      },
      fit: {
        title: "Is this for you?",
        questions: [
          "Do you run more than three non-production AWS accounts with their own NAT Gateways?",
          "Does each one process less than about 1 TB a month through NAT?",
          "Can someone on the team own a small Terraform module and its patching?",
        ],
        paras: [
          "Three yes answers: the saving is real. With one or two accounts it is about $1,500 a year each, which is often not worth running your own network appliance.",
        ],
      },
      setup: {
        title: "How to set it up",
        items: [
          "Use a maintained NAT image (the open-source fck-nat project builds ARM images for t4g), or Amazon Linux 2023 with IP forwarding and an iptables or nftables masquerade rule.",
          "Disable the source/destination check on the instance.",
          "Run it in an Auto Scaling group of one, with a fixed network interface and Elastic IP that the instance attaches at boot, so the private route tables (0.0.0.0/0 to that interface) stay valid after a replacement.",
          "Keep it in the same Terraform or CDK module as the NAT Gateway version, which stays the production variant.",
          "After the switch, check in Cost Explorer that the NatGateway-Hours and NatGateway-Bytes usage types drop to zero in those accounts.",
        ],
      },
      gotchas: {
        title: "Gotchas",
        items: [
          "Bandwidth: a t4g.nano has 0.032 Gbps of baseline network bandwidth and can burst to 5 Gbps. 500 GB a month averages about 1.5 Mbps, so dev traffic fits, but large image pulls or data loads use burst credits and slow down when they run out. A t4g.micro doubles the baseline for about $3 more a month.",
          "Memory: 0.5 GiB is enough for NAT, not for anything else on the same box.",
          "Failover: when the instance is replaced, open connections drop and egress stops for a few minutes. Fine for dev, not for production.",
          "Patching: it is a server you own. Patch it, monitor it, alarm on it.",
          "Cross-AZ traffic: above about 1.2 TB a month per account, one instance per zone becomes cheaper than paying cross-AZ fees. The calculator below picks the cheaper setup.",
          "S3 and DynamoDB: add gateway endpoints anyway, that traffic should not go through any NAT.",
          "Regional NAT Gateway: the newer regional mode is still billed per hour in each zone where it is active, so it does not change this comparison.",
          "Production: keep managed NAT Gateways there.",
        ],
      },
    },
    calcTitle: "Try it with your own numbers",
    backLabel: "All AWS cost scenarios",
    articleDescription:
      "What three NAT Gateways cost in every non-production AWS account, what a t4g.nano NAT instance costs instead, and when not to switch, priced for five Regions.",
  },

  natFaq: {
    header: ["FAQ / 04", "NAT instances"],
    title: "Questions before you switch",
    items: [
      {
        question: "Is a NAT instance safe for production?",
        answer: [
          "We do not recommend it. A managed NAT Gateway scales on its own, is redundant within its zone and needs no patching. The saving matters in non-production accounts, where a few minutes of interruption during a replacement is acceptable.",
        ],
      },
      {
        question: "What about the new Regional NAT Gateway?",
        answer: [
          "It simplifies the design (one gateway that spans zones), but AWS still bills it per hour in each zone where it is active, plus per GB processed. For this comparison the cost is the same as three zonal gateways.",
        ],
      },
      {
        question: "Why count the public IPv4 address?",
        answer: [
          "Since February 2024 AWS bills every public IPv4 address $0.005 per hour, including the Elastic IPs used by public NAT Gateways. Three gateways means three addresses, about $11 a month.",
        ],
      },
      {
        question: "Can we avoid NAT completely?",
        answer: [
          "Sometimes. Gateway endpoints remove S3 and DynamoDB traffic, interface endpoints cover other AWS services, and IPv6-only subnets with an egress-only internet gateway work for destinations that support IPv6. Many public services are still IPv4-only, so most accounts keep some form of NAT.",
        ],
      },
      {
        question: "Can you do this in our accounts?",
        answer: [
          "Yes. It is one of the checks in our two-week AWS cost audit: we measure the NAT traffic of each account first, then deliver the Terraform change you can review.",
        ],
      },
    ],
  },
};

export default natInstanceEn;
