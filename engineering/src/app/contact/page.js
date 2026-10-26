import ContactPage from "@/views/ContactPage";
import { meta } from "@/lib/meta";

export const metadata = meta("fr", "contact");

export default function Page() {
  return <ContactPage lang="fr" />;
}
