import { z } from "zod";
import { PokemonTypeSchema, type PokemonType } from "../lib/pokemonTypeMap";
/* ========================================
   スキーマ
======================================== */
const PokemonCardSchema = z.object({
  types: z.array(
    z.object({
      slot: z.number(),
      type: z.object({
        name: PokemonTypeSchema,
        url: z.string(),
      }),
    }),
  ),
  sprites: z.object({
    other: z.object({
      "official-artwork": z.object({
        front_default: z.string().nullable(),
      }),
    }),
  }),
  species: z.object({
    url: z.string(),
  }),
});

const SpeciesCardSchema = z.object({
  is_legendary: z.boolean(),
  is_mythical: z.boolean(),
  pokedex_numbers: z.array(
    z.object({
      entry_number: z.number(),
      pokedex: z.object({
        // 全国図鑑 = "national"
        name: z.string(),
      }),
    }),
  ),
  genera: z.array(
    z.object({
      genus: z.string(),
      language: z.object({
        name: z.string(),
      }),
    }),
  ),
});

/* ========================================
   型
======================================== */
export type PokemonCard = {
  isLegendary: boolean;
  isMythical: boolean;
  dexNumber: number | null;
  genus: string | null;
  types: PokemonType[];
  image: string | null;
};
/* ========================================
   データ取得
======================================== */

export const getPokemonCard = async (pokemonName: string): Promise<PokemonCard> => {
  // pokemon
  const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  if (!pokemonRes.ok) {
    throw new Error(`pokemon の取得失敗: ${pokemonRes.status}`);
  }
  const rawPokemonRes: unknown = await pokemonRes.json();
  const pokemonResult = PokemonCardSchema.safeParse(rawPokemonRes);
  if (!pokemonResult.success) {
    console.error(pokemonResult.error);
    throw new Error("pokemonレスポンスの形式が想定と異なります");
  }
  const pokemonData = pokemonResult.data;

  // species
  const speciesRes = await fetch(pokemonData.species.url);
  if (!speciesRes.ok) {
    throw new Error(`species の取得失敗: ${speciesRes.status}`);
  }
  const rawSpeciesRes: unknown = await speciesRes.json();
  const speciesResult = SpeciesCardSchema.safeParse(rawSpeciesRes);
  if (!speciesResult.success) {
    console.error(speciesResult.error);
    throw new Error("speciesレスポンスの形式が想定と異なります");
  }
  const speciesData = speciesResult.data;

  const isLegendary = speciesData.is_legendary;
  const isMythical = speciesData.is_mythical;
  const dexNumber = speciesData.pokedex_numbers.find((entry) => entry.pokedex.name === "national")?.entry_number ?? null;
  const genus = speciesData.genera.find((entry) => entry.language.name === "ja-hrkt")?.genus ?? speciesData.genera.find((entry) => entry.language.name === "en")?.genus ?? null;
  const types = [...pokemonData.types].sort((a, b) => a.slot - b.slot).map((entry) => entry.type.name);
  const image = pokemonData.sprites.other["official-artwork"].front_default;

  const pokemonCard: PokemonCard = {
    isLegendary,
    isMythical,
    dexNumber,
    genus,
    types,
    image,
  };
  return pokemonCard;
};
