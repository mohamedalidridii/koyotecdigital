const isFr = document.documentElement.lang === "fr";

export const services = [
  {
    name: isFr ? "Identité visuelle" : "Brand Identity",
    img: "/spotlight/spotlight-1.jpg",
    indicatorText: "[ Branding ]",
  },

  {
    name: isFr ? "Création de site web" : "Web Design",
    img: "/spotlight/spotlight-2.jpg",
    indicatorText: "[ Web ]",
  },

  {
    name: isFr ? "Design UI/UX" : "UI/UX Design",
    img: "/spotlight/spotlight-3.jpg",
    indicatorText: "[ Interface ]",
  },

  {
    name: isFr ? "Référencement SEO" : "SEO",
    img: "/spotlight/spotlight-4.jpg",
    indicatorText: "[ Google ]",
  },
];
