import { getDict } from "@/i18n/config";

import LookbookView from "@/components/LookbookView/LookbookView";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDict(lang);
  return { title: dict.lookbook.label };
}

export default function Lookbook() {
  return <LookbookView />;
}
