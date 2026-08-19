import type { PokemonTypeName } from "@/types/pokemon";

/**
 * Optional full-scene artwork backgrounds shown behind the Pokémon in a card's
 * window (files live in /public/type_bg). Types without an entry fall back to
 * the plain light window. Add more here as the artwork is produced.
 */
const TYPE_BACKGROUNDS: Partial<Record<PokemonTypeName, string>> = {
  // WebP (159 KB) — the source PNG is 2.4 MB and freezes the page as a full-card bg
  grass: "/type_bg/grass_bg.webp",
  electric: "/type_bg/electric_bg.webp",
  water: "/type_bg/water_bg.webp",
  fire: "/type_bg/fire_bg.webp",
  bug: "/type_bg/bug_bg.webp",
};

export function getTypeBackground(type: string): string | null {
  return TYPE_BACKGROUNDS[type as PokemonTypeName] ?? null;
}
