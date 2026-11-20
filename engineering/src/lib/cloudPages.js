// the four cloud pages: dictionary key (content/cloud.*.js), route, and meta key (t.meta.pages)
export const CLOUD_PAGES = [
  { key: "hub", route: "/cloud", meta: "cloud" },
  { key: "consultantTn", route: "/cloud/consultant-aws-tunisie", meta: "cloud/consultant-aws-tunisie" },
  { key: "migrationTn", route: "/cloud/migration-cloud-tunisie", meta: "cloud/migration-cloud-tunisie" },
  { key: "consultantFr", route: "/cloud/consultant-aws-france", meta: "cloud/consultant-aws-france" },
];

export const cloudPage = (key) => CLOUD_PAGES.find((p) => p.key === key);
