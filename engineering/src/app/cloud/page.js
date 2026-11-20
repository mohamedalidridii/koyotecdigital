import CloudPage from "@/views/CloudPage";
import { meta } from "@/lib/meta";

export const metadata = meta("fr", "cloud");

export default function Page() {
  return <CloudPage lang="fr" pageKey="hub" />;
}
