import CloudPage from "@/views/CloudPage";
import { meta } from "@/lib/meta";

export const metadata = meta("en", "cloud");

export default function Page() {
  return <CloudPage lang="en" pageKey="hub" />;
}
