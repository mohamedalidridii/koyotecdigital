import articles from "@/articles";
import { generateSlug } from "@/utils";

// static export: prerender one page per article
export function generateStaticParams() {
  return articles.map((a) => ({ slug: generateSlug(a.title) }));
}

export default function Layout({ children }) {
  return children;
}
