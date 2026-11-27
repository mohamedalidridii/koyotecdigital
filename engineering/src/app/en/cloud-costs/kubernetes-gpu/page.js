import GpuCostsPage from "@/views/GpuCostsPage";
import { meta } from "@/lib/meta";

export const metadata = meta("en", "cloud-costs/kubernetes-gpu", { type: "article" });

export default function Page() {
  return <GpuCostsPage lang="en" />;
}
