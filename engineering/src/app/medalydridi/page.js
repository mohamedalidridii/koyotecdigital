import FounderPage from "@/views/FounderPage";
import { meta } from "@/lib/meta";

export const metadata = { ...meta("fr", "medalydridi"), openGraph: { ...meta("fr", "medalydridi").openGraph, type: "profile", images: ["https://www.koyotec.digital/founder/portrait.webp"] } };

export default function Page() {
  return <FounderPage lang="fr" />;
}
