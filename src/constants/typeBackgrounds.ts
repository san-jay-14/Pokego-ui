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
  psychic: "/type_bg/psychic_bg.webp",
  ice: "/type_bg/ice_bg.webp",
  dragon: "/type_bg/dragon_bg.webp",
  dark: "/type_bg/dark_bg.webp",
  fairy: "/type_bg/fairy_bg.webp",
  fighting: "/type_bg/fighting_bg.webp",
  poison: "/type_bg/poison_bg.webp",
  ground: "/type_bg/ground_bg.webp",
  flying: "/type_bg/flying_bg.webp",
  rock: "/type_bg/rock_bg.webp",
  ghost: "/type_bg/ghost_bg.webp",
  steel: "/type_bg/steel_bg.webp",
  normal: "/type_bg/normal_bg.webp",
};

export function getTypeBackground(type: string): string | null {
  return TYPE_BACKGROUNDS[type as PokemonTypeName] ?? null;
}
