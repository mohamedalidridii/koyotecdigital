import products from "@/products";
import { generateSlug } from "@/utils";

// static export: prerender one page per product
export function generateStaticParams() {
  return products.map((p) => ({ slug: generateSlug(p.name) }));
}

export default function Layout({ children }) {
  return children;
}
