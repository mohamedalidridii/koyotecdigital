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
        "AI, cloud, DevOps, cybersecurity, data and industrial IoT engineering for companies in Europe and the Gulf, from the first audit to production.",
      email: "contact@koyotec.digital",
      telephone: "+21652405699",
      address: {
        "@type": "PostalAddress",
        streetAddress: "28 Rue Boukhara",
        addressLocality: "Ariana",
        postalCode: "2037",
        addressCountry: "TN",
      },
      areaServed: ["Europe", "Middle East", "Africa", "North America"].map((name) => ({ "@type": "Place", name })),
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
