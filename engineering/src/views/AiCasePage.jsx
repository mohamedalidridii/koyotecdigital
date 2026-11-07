import AiCase from "@/components/AiCases/AiCase";

export default function AiCasePage({ slug, collection = "aiCases", base = "/ai" }) {
  return <AiCase slug={slug} collection={collection} base={base} />;
}
