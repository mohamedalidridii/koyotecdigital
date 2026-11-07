import AiCasePage from "@/views/AiCasePage";
import { DICTS } from "@/lib/i18n";
import { metaFor } from "@/lib/meta";

const LANG = "en";
const cases = DICTS[LANG].devopsCases.cases;

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = cases.find((x) => x.slug === slug);
  return metaFor(LANG, `/devops/${slug}`, `${c.title} — ${c.client} · Koyotec Engineering`, c.summary);
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <AiCasePage lang={LANG} slug={slug} collection="devopsCases" base="/devops" />;
}
