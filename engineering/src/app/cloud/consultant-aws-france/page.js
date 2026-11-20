import CloudPage from "@/views/CloudPage";
import { meta } from "@/lib/meta";

export const metadata = meta("fr", "cloud/consultant-aws-france");

export default function Page() {
  return <CloudPage lang="fr" pageKey="consultantFr" />;
}
