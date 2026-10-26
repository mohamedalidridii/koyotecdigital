import HtmlLang from "@/components/HtmlLang";
import { meta } from "@/lib/meta";

export const metadata = meta("en", null);

// the root layout renders <html lang="fr">; the static export has a single root, so English pages fix it on mount
export default function EnglishLayout({ children }) {
  return (
    <>
      <HtmlLang lang="en" />
      {children}
    </>
  );
}
