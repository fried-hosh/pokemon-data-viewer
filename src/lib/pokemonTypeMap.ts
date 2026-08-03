import { z } from "zod";

export const PokemonTypeSchema = z.enum(["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]);

export type PokemonType = z.infer<typeof PokemonTypeSchema>;

export interface TypeInfo {
  ja: string;
  bgColorClass: string;
}

export const pokemonTypeMap: Record<PokemonType, TypeInfo> = {
  normal: { ja: "ノーマル", bgColorClass: "bg-[#A8A77A]" },
  fire: { ja: "ほのお", bgColorClass: "bg-[#EE8130]" },
  water: { ja: "みず", bgColorClass: "bg-[#6390F0]" },
  electric: { ja: "でんき", bgColorClass: "bg-[#F7D02C]" },
  grass: { ja: "くさ", bgColorClass: "bg-[#7AC74C]" },
  ice: { ja: "こおり", bgColorClass: "bg-[#96D9D6]" },
  fighting: { ja: "かくとう", bgColorClass: "bg-[#C22E28]" },
  poison: { ja: "どく", bgColorClass: "bg-[#A33EA1]" },
  ground: { ja: "じめん", bgColorClass: "bg-[#E2BF65]" },
  flying: { ja: "ひこう", bgColorClass: "bg-[#A98FF3]" },
  psychic: { ja: "エスパー", bgColorClass: "bg-[#F95587]" },
  bug: { ja: "むし", bgColorClass: "bg-[#A6B91A]" },
  rock: { ja: "いわ", bgColorClass: "bg-[#B6A136]" },
  ghost: { ja: "ゴースト", bgColorClass: "bg-[#735797]" },
  dragon: { ja: "ドラゴン", bgColorClass: "bg-[#6F35FC]" },
  dark: { ja: "あく", bgColorClass: "bg-[#705746]" },
  steel: { ja: "はがね", bgColorClass: "bg-[#B7B7CE]" },
  fairy: { ja: "フェアリー", bgColorClass: "bg-[#D685AD]" },
};
