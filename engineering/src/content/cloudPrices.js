// AWS public list prices (USD, excluding tax, Free Tier and discounts such as Savings Plans or EDP).
// Checked on 2026-11-18 against the AWS Price List API, the AWS pricing pages and the AWS Spot price feed.
// Update `checked` and the values together.
export const PRICES_CHECKED = "2026-11-18";
// NAT instance scenario fields (natHour, nanoHour, gp3Gb, ipv4Hour) and natGb / interAz re-checked on this date
// in the AWS pricing feeds (natgateway.json, ec2-ondemand Linux, ebs.json) and the VPC pricing page
export const NAT_PRICES_CHECKED = "2026-11-22";
export const HOURS_PER_MONTH = 730;

export const REGIONS = [
  { id: "eu-west-3", label: { fr: "Europe (Paris)", en: "Europe (Paris)" } },
  { id: "eu-central-1", label: { fr: "Europe (Francfort)", en: "Europe (Frankfurt)" } },
  { id: "me-central-1", label: { fr: "Moyen-Orient (Émirats arabes unis)", en: "Middle East (UAE)" } },
  { id: "me-south-1", label: { fr: "Moyen-Orient (Bahreïn)", en: "Middle East (Bahrain)" } },
  { id: "us-east-1", label: { fr: "États-Unis (Virginie du Nord)", en: "US East (N. Virginia)" } },
];

// natGb: NAT Gateway data processing, $/GB · interAz: EC2 data transfer between AZs, $/GB in each direction
// m5OnDemand / m5Spot: m5.2xlarge Linux, $/hour (Spot = lowest price in the region published by AWS that day)
// wcuHour: DynamoDB provisioned write capacity unit, $/hour (Standard table class)
// natHour: NAT Gateway, $/hour per gateway · nanoHour: t4g.nano On-Demand Linux, $/hour
// gp3Gb: EBS gp3 storage, $/GB-month · ipv4Hour: public IPv4 address (in use or idle), $/hour
export const PRICES = {
  "eu-west-3": { natGb: 0.05, interAz: 0.01, m5OnDemand: 0.448, m5Spot: 0.1486, wcuHour: 0.000772, natHour: 0.05, nanoHour: 0.0047, gp3Gb: 0.0928, ipv4Hour: 0.005 },
  "eu-central-1": { natGb: 0.052, interAz: 0.01, m5OnDemand: 0.46, m5Spot: 0.1803, wcuHour: 0.000793, natHour: 0.052, nanoHour: 0.0048, gp3Gb: 0.0952, ipv4Hour: 0.005 },
  "me-central-1": { natGb: 0.0528, interAz: 0.01, m5OnDemand: 0.471, m5Spot: 0.1997, wcuHour: 0.0008085, natHour: 0.0528, nanoHour: 0.0051, gp3Gb: 0.0968, ipv4Hour: 0.005 },
  "me-south-1": { natGb: 0.0528, interAz: 0.01, m5OnDemand: 0.471, m5Spot: 0.1692, wcuHour: 0.0008085, natHour: 0.0528, nanoHour: 0.005, gp3Gb: 0.0968, ipv4Hour: 0.005 },
  "us-east-1": { natGb: 0.045, interAz: 0.01, m5OnDemand: 0.384, m5Spot: 0.1612, wcuHour: 0.00065, natHour: 0.045, nanoHour: 0.0042, gp3Gb: 0.08, ipv4Hour: 0.005 },
};

// NAT instance scenario: one t4g.nano with an 8 GB gp3 root volume and one public IPv4 address
export const NAT_INSTANCE_DISK_GB = 8;

// monthly cost for one account, NAT Gateways vs NAT instance(s); traffic in GB processed per month
// (in + out), spread evenly over the zones. Internet egress is the same in both setups, so it is left out.
export function natInstanceCosts(p, { zones = 3, gb = 0 } = {}) {
  const z = Math.max(1, Math.round(zones));
  const h = HOURS_PER_MONTH;
  const gateways = z * p.natHour * h + z * p.ipv4Hour * h + gb * p.natGb;
  const box = p.nanoHour * h + NAT_INSTANCE_DISK_GB * p.gp3Gb + p.ipv4Hour * h;
  const crossAz = gb * ((z - 1) / z) * p.interAz * 2;
  const shared = box + crossAz;
  const perZone = z * box;
  return { gateways, shared, perZone, best: Math.min(shared, perZone), sharedIsBest: shared <= perZone, box, crossAz };
}

export const SOURCES = [
  { label: "Amazon VPC pricing (NAT Gateway)", href: "https://aws.amazon.com/vpc/pricing/" },
  { label: "Gateway endpoints (no additional charge)", href: "https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html" },
  { label: "EC2 on-demand pricing & data transfer within a Region", href: "https://aws.amazon.com/ec2/pricing/on-demand/" },
  { label: "EC2 Spot pricing", href: "https://aws.amazon.com/ec2/spot/pricing/" },
  { label: "DynamoDB pricing (provisioned capacity)", href: "https://aws.amazon.com/dynamodb/pricing/provisioned/" },
  { label: "DynamoDB partition key best practices (1,000 WCU/s per partition)", href: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html" },
  { label: "Kubernetes traffic distribution (PreferSameZone)", href: "https://kubernetes.io/docs/reference/networking/virtual-ips/" },
  { label: "AWS App Mesh end of support (30 Sep 2026)", href: "https://docs.aws.amazon.com/app-mesh/latest/userguide/what-is-app-mesh.html" },
  { label: "Public IPv4 address pricing (Amazon VPC pricing)", href: "https://aws.amazon.com/vpc/pricing/" },
  { label: "Amazon EBS pricing (gp3)", href: "https://aws.amazon.com/ebs/pricing/" },
  { label: "EC2 general purpose instance specifications (t4g network bandwidth)", href: "https://docs.aws.amazon.com/ec2/latest/instancetypes/gp.html" },
  { label: "Compare NAT gateways and NAT instances", href: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-comparison.html" },
];
