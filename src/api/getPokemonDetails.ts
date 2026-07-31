// 名前、画像、タイプ、種族値(個別・合計)、特性
// 進化チェーン、進化レベル/手段（名前or画像クリックで該当ポケモンのDetailに遷移）
// タイプ相性
// 覚える技
import { z } from "zod";

/* ========================================
   スキーマ
======================================== */

const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  abilities: z.array(
    z.object({
      ability: z.object({
        name: z.string(),
        url: z.string(),
      }),
      is_hidden: z.boolean(),
      slot: z.number(),
    }),
  ),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      stat: z.object({
        name: z.string(),
      }),
    }),
  ),
  types: z.array(
    z.object({
      slot: z.number(),
      type: z.object({
        name: z.string(),
        url: z.string(),
      }),
    }),
  ),
  species: z.object({
    name: z.string(),
    url: z.string(),
  }),
  sprites: z.object({
    front_default: z.string().nullable(),
  }),
});

/* ========================================
   型
======================================== */

/* ========================================
   データ取得
======================================== */

export const getPokemonDetails = async (pokemonName: string) => {
  const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

  if (!pokemonRes.ok) {
    throw new Error(`pokemonの取得失敗: ${pokemonRes.status}`);
  }
  const rawPokemon: unknown = await pokemonRes.json();

  const pokemonResult = PokemonSchema.safeParse(rawPokemon);

  if (!pokemonResult.success) {
    console.error(pokemonResult.error);
    throw new Error("pokemonレスポンスの形式が想定と異なります");
  }

  const pokemonData = pokemonResult.data;

  console.log(pokemonData);
  return pokemonData;
};
