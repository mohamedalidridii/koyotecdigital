import AiCasesPage from "@/views/AiCasesPage";
import { meta } from "@/lib/meta";

export const metadata = meta("en", "devops");

export default function Page() {
  return <AiCasesPage lang="en" collection="devopsCases" base="/devops" icon="TerminalIcon" />;
}
