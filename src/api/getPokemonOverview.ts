import { z } from "zod";
import { toPokemonApiName } from "../lib/pokemonNameMap.js";
import { type PokemonType } from "../lib/pokemonTypeMap.js";

/* ========================================
   スキーマ
======================================== */

const PokemonTypeSchema = z.enum(["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]);

const SpeciesSchema = z.object({
  varieties: z.array(
    z.object({
      is_default: z.boolean(),
      pokemon: z.object({
        name: z.string(),
        url: z.string(),
      }),
    }),
  ),
});

const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  types: z.array(
    z.object({
      slot: z.number(),
      type: z.object({
        name: PokemonTypeSchema,
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
});

const PokemonArraySchema = z.array(PokemonSchema);

/* ========================================
   型
======================================== */

export type PokemonSummary = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  imageUrl: string | null;
};

/* ========================================
   データ取得
======================================== */

export const getPokemonOverview = async (name: string): Promise<PokemonSummary[]> => {
  const pokemonIdentifier = toPokemonApiName(name);

  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonIdentifier}`);
  if (!speciesRes.ok) {
    throw new Error(`species の取得失敗: ${speciesRes.status}`);
  }
  const rawSpecies: unknown = await speciesRes.json();
  const speciesResult = SpeciesSchema.safeParse(rawSpecies);
  if (!speciesResult.success) {
    console.error(speciesResult.error);
    throw new Error("speciesレスポンスの形式が想定と異なります");
  }
  const speciesData = speciesResult.data;

  // varietiesから全フォルムのpokemon取得
  const pokemonRes = await Promise.all(speciesData.varieties.map((item) => fetch(item.pokemon.url)));
  for (const res of pokemonRes) {
    if (!res.ok) {
      throw new Error(`pokemon の取得失敗: ${res.status}`);
    }
  }
  const rawPokemonDatas = await Promise.all(pokemonRes.map((res) => res.json()));
  const pokemonResults = PokemonArraySchema.safeParse(rawPokemonDatas);
  if (!pokemonResults.success) {
    console.error(pokemonResults.error);
    throw new Error("pokemonレスポンスの形式が想定と異なります");
  }
  const pokemonDatas = pokemonResults.data;

  const pokemonSummaries: PokemonSummary[] = [];

  // varieties一件分のデータを作成 ・ push
  for (const pokemonData of pokemonDatas) {
    const types = [...pokemonData.types].sort((a, b) => a.slot - b.slot).map((type) => type.type.name);

    const PokemonSummary: PokemonSummary = {
      id: pokemonData.id,
      name: pokemonData.name,
      height: pokemonData.height,
      weight: pokemonData.weight,
      types,
      imageUrl: pokemonData.sprites.other["official-artwork"].front_default ?? null,
    };
    pokemonSummaries.push(PokemonSummary);
  }
  return pokemonSummaries;
};
