import AiCasesPage from "@/views/AiCasesPage";
import { meta } from "@/lib/meta";

export const metadata = meta("fr", "devops");

export default function Page() {
  return <AiCasesPage lang="fr" collection="devopsCases" base="/devops" icon="TerminalIcon" />;
}
