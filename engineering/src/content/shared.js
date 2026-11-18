// Language-independent data. Contact details follow content/site.json of the main site.
// cookieless analytics (Umami, self-hosted on the KOYOTEC VPS): the tracker loads only once `id` is set
export const ANALYTICS = { src: "https://analytics.koyotec.digital/script.js", id: "45c8b402-4a10-4f69-9b4d-3b2466193c36" };

export const CONTACT = {
  phone: { href: "tel:+21652405699", text: "+216 52 405 699", event: "phone" },
  email: { href: "mailto:contact@koyotec.digital", text: "contact@koyotec.digital", event: "email" },
  whatsapp: "21652405699",
  social: [
    { href: "https://www.linkedin.com/company/88672837", text: "LinkedIn", external: true, event: "linkedin" },
    { href: "https://www.instagram.com/koyotec.digital/", text: "Instagram", external: true },
    { href: "https://www.youtube.com/@medaly.dridiy", text: "YouTube", external: true },
  ],
};

export const WORK_IMAGES = [
  "/images/work/rag-assistant.webp",
  "/images/work/cloud-migration.webp",
  "/images/work/cicd-kubernetes.webp",
  "/images/work/security-audit.webp",
  "/images/work/bi-dashboard.webp",
];

export const TOOLS = [
  ["AWS", "Azure", "Google Cloud", "Kubernetes"],
  ["Docker", "Terraform", "Ansible", "GitHub Actions", "GitLab CI"],
  ["Prometheus", "Grafana", "Wazuh", "OWASP ZAP"],
  ["PyTorch", "LangChain", "PostgreSQL", "Power BI", "Metabase"],
];
