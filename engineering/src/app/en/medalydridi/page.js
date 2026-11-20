import FounderPage from "@/views/FounderPage";
import { meta } from "@/lib/meta";

export const metadata = { ...meta("en", "medalydridi"), openGraph: { ...meta("en", "medalydridi").openGraph, type: "profile", images: ["https://www.koyotec.digital/founder/portrait.webp"] } };

export default function Page() {
  return <FounderPage lang="en" />;
}
