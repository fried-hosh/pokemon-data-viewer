export type PokemonType = "normal" | "fire" | "water" | "electric" | "grass" | "ice" | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug" | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export interface TypeInfo {
  en: PokemonType;
  ja: string;
  bgColorClass: string;
}

export const pokemonTypeMap: Record<PokemonType, TypeInfo> = {
  normal: { en: "normal", ja: "ノーマル", bgColorClass: "bg-[#A8A77A]" },
  fire: { en: "fire", ja: "ほのお", bgColorClass: "bg-[#EE8130]" },
  water: { en: "water", ja: "みず", bgColorClass: "bg-[#6390F0]" },
  electric: { en: "electric", ja: "でんき", bgColorClass: "bg-[#F7D02C]" },
  grass: { en: "grass", ja: "くさ", bgColorClass: "bg-[#7AC74C]" },
  ice: { en: "ice", ja: "こおり", bgColorClass: "bg-[#96D9D6]" },
  fighting: { en: "fighting", ja: "かくとう", bgColorClass: "bg-[#C22E28]" },
  poison: { en: "poison", ja: "どく", bgColorClass: "bg-[#A33EA1]" },
  ground: { en: "ground", ja: "じめん", bgColorClass: "bg-[#E2BF65]" },
  flying: { en: "flying", ja: "ひこう", bgColorClass: "bg-[#A98FF3]" },
  psychic: { en: "psychic", ja: "エスパー", bgColorClass: "bg-[#F95587]" },
  bug: { en: "bug", ja: "むし", bgColorClass: "bg-[#A6B91A]" },
  rock: { en: "rock", ja: "いわ", bgColorClass: "bg-[#B6A136]" },
  ghost: { en: "ghost", ja: "ゴースト", bgColorClass: "bg-[#735797]" },
  dragon: { en: "dragon", ja: "ドラゴン", bgColorClass: "bg-[#6F35FC]" },
  dark: { en: "dark", ja: "あく", bgColorClass: "bg-[#705746]" },
  steel: { en: "steel", ja: "はがね", bgColorClass: "bg-[#B7B7CE]" },
  fairy: { en: "fairy", ja: "フェアリー", bgColorClass: "bg-[#D685AD]" },
};
