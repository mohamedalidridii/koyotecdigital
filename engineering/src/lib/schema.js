import { localize } from "@/lib/i18n";

export const SITE = "https://www.koyotec.digital/engineering";
export const ORG_ID = `${SITE}/#organization`;
export const pageUrl = (lang, route) => `${SITE}${localize(lang, route)}/`.replace(/\/\/$/, "/");

// Koyotec Engineering, the engineering arm of KOYOTEC (same organisation data as koyotec.digital)
export const ORGANIZATION = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": ORG_ID,
      name: "Koyotec Engineering",
      url: `${SITE}/`,
      logo: "https://www.koyotec.digital/site-icon.png",
      image: "https://www.koyotec.digital/og/koyotec.jpg",
      description:
        "AI, cloud, DevOps, cybersecurity, data and industrial IoT engineering for companies in Europe, the Gulf and Asia, from the first audit to production.",
      email: "contact@koyotec.digital",
      telephone: "+21652405699",
      address: {
        "@type": "PostalAddress",
        streetAddress: "28 Rue Boukhara",
        addressLocality: "Ariana",
        postalCode: "2037",
        addressCountry: "TN",
      },
      areaServed: ["Europe", "Middle East", "Asia", "Africa", "North America"].map((name) => ({ "@type": "Place", name })),
      knowsLanguage: ["en", "fr", "ar"],
      knowsAbout: [
        "Artificial intelligence",
        "Retrieval-augmented generation",
        "Cloud architecture",
        "AWS",
        "Kubernetes",
        "DevOps",
        "Site reliability engineering",
        "Cybersecurity",
        "Business intelligence",
        "Industrial IoT",
        "SCADA",
        "Predictive maintenance",
      ],
      parentOrganization: { "@id": "https://www.koyotec.digital/#organization" },
      founder: { "@id": "https://www.koyotec.digital/medalydridi#person" },
      sameAs: ["https://www.linkedin.com/company/88672837"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "Koyotec Engineering",
      url: `${SITE}/`,
      inLanguage: ["fr", "en"],
      publisher: { "@id": ORG_ID },
    },
  ],
};

// cloud pages (/cloud and its three landing pages): a Service offered by the organisation, written and
// delivered by the founder, plus the breadcrumb trail Engineering > Cloud > page
const FOUNDER_ID = "https://www.koyotec.digital/medalydridi#person";
const CLOUD_AREA = {
  hub: ["Tunisia", "France", "Europe", "Middle East", "Asia"],
  consultantTn: ["Tunisia", "Europe", "Middle East", "Asia"],
  migrationTn: ["Tunisia", "Europe", "Middle East", "Asia"],
  consultantFr: ["France", "Europe", "Middle East", "Asia"],
};
const CLOUD_TYPE = {
  hub: "Cloud engineering",
  consultantTn: "AWS consulting",
  migrationTn: "Cloud migration",
  consultantFr: "Nearshore AWS cloud consulting",
};

export function cloudSchema({ lang, key, route, title, description }) {
  const url = pageUrl(lang, route);
  const crumbs = [
    { name: "Koyotec Engineering", item: pageUrl(lang, "/") },
    { name: "Cloud", item: pageUrl(lang, "/cloud") },
  ];
  if (route !== "/cloud") crumbs.push({ name: title, item: url });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: title,
        serviceType: CLOUD_TYPE[key],
        description,
        url,
        inLanguage: lang,
        provider: { "@id": ORG_ID },
        brand: { "@id": ORG_ID },
        areaServed: CLOUD_AREA[key].map((name) => ({ "@type": "Place", name })),
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: lang,
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${url}#service` },
        author: { "@id": FOUNDER_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
      },
    ],
  };
}

// founder page of the Engineering site: a ProfilePage about the same Person entity as koyotec.digital/medalydridi,
// so search engines merge both pages into one identity
export function founderSchema({ lang, title, description, jobTitles, sameAs }) {
  const url = pageUrl(lang, "/medalydridi");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: title,
        description,
        inLanguage: lang,
        isPartOf: { "@id": `${SITE}/#website` },
        mainEntity: {
          "@type": "Person",
          "@id": FOUNDER_ID,
          name: "Mohamed Ali Dridi",
          alternateName: ["Med Ali Dridi", "Medaly Dridi"],
          jobTitle: jobTitles,
          image: "https://www.koyotec.digital/founder/portrait.webp",
          worksFor: { "@id": ORG_ID },
          sameAs: ["https://www.koyotec.digital/medalydridi", ...sameAs],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Koyotec Engineering", item: pageUrl(lang, "/") },
          { "@type": "ListItem", position: 2, name: "Mohamed Ali Dridi", item: url },
        ],
      },
    ],
  };
}
