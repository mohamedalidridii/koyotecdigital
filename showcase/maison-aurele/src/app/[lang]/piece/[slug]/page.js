import { notFound } from "next/navigation";

import { getDict, locales } from "@/i18n/config";
import { pieces, getPiece } from "@/data/pieces";

import PieceView from "@/components/PieceView/PieceView";
import PieceGrid from "@/components/PieceCard/PieceGrid";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => pieces.map((piece) => ({ lang, slug: piece.slug })));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const piece = getPiece(slug);
  if (!piece) return {};
  return {
    title: piece.name[lang],
    description: piece.description[lang],
  };
}

export default async function Piece({ params }) {
  const { lang, slug } = await params;
  const piece = getPiece(slug);
  if (!piece) notFound();
  const dict = getDict(lang);

  // Same category first, then the rest of the season
  const related = [
    ...pieces.filter((p) => p.slug !== slug && p.category === piece.category),
    ...pieces.filter((p) => p.slug !== slug && p.category !== piece.category),
  ]
    .slice(0, 4)
    .map((p) => p.slug);

  return (
    <>
      <PieceView piece={piece} index={pieces.indexOf(piece) + 1} total={pieces.length} />
      <PieceGrid label="SS27" title={dict.piece.related} slugs={related} />
    </>
  );
}
