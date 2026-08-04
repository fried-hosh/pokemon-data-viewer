// 名前、画像、タイプ、種族値(個別・合計)、特性
// 進化チェーン、進化レベル/手段（名前or画像クリックで該当ポケモンのDetailに遷移）
// タイプ相性
// 覚える技
import { z } from "zod";
import { type PokemonType } from "../lib/pokemonTypeMap";
import { PokemonTypeSchema } from "../lib/pokemonTypeMap";

/* ========================================
   スキーマ
======================================== */

const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  abilities: z.array(
    z.object({
      ability: z.object({
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
        name: PokemonTypeSchema,
        url: z.string(),
      }),
    }),
  ),
  species: z.object({
    name: z.string(),
    url: z.string(),
  }),
  sprites: z.object({
    other: z.object({
      "official-artwork": z.object({
        front_default: z.string().nullable(),
      }),
    }),
  }),
});

const AbilitySchema = z.object({
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: z.object({
        name: z.string(),
      }),
    }),
  ),
  names: z.array(
    z.object({
      language: z.object({
        name: z.string(),
      }),
      name: z.string(),
    }),
  ),
});

const AbilityArraySchema = z.array(AbilitySchema);

const SpeciesSchema = z.object({
  evolution_chain: z.object({
    url: z.string(),
  }),
});

// 進化条件
const EvolutionDetailSchema = z.object({
  min_level: z.number().nullable(),
  item: z
    .object({
      name: z.string(),
    })
    .nullable(),
  trigger: z
    .object({
      name: z.string(),
    })
    .nullable(),
});

// 一件分の再帰スキーマ
const EvolutionNodeSchema = z.object({
  species: z.object({
    name: z.string(),
  }),
  evolution_details: z.array(EvolutionDetailSchema),

  get evolves_to() {
    return z.array(EvolutionNodeSchema);
  },
});

// 進化チェーンの全体スキーマ
const EvolutionChainSchema = z.object({
  chain: EvolutionNodeSchema,
});

/* ========================================
   型
======================================== */
type EvolutionNode = z.infer<typeof EvolutionNodeSchema>;

type EvolutionItem = {
  name: string;
  evolutionDetails: {
    minLevel: number | null;
    trigger: string | null;
    item: string | null;
  }[];
};

export type PokemonDetails = {
  id: number;
  name: string;
  imageUrl: string | null;
  types: PokemonType[];
  stats: { name: string; baseStat: number }[];
  abilities: {
    isHidden: boolean;
    description: string | null;
    name: string | null;
  }[];
  evolutions: EvolutionItem[];
};

/* ========================================
   データ取得
======================================== */

export const getPokemonDetails = async (pokemonName: string): Promise<PokemonDetails> => {
  // pokemon
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

  // 特性の詳細
  const abilityDetailUrls = pokemonData.abilities.map((ability) => ability.ability.url);
  const abilityDetailResponses = await Promise.all(abilityDetailUrls.map((url) => fetch(url)));

  for (const res of abilityDetailResponses) {
    if (!res.ok) {
      throw new Error(`abilityDescriptionの取得失敗: ${res.status}`);
    }
  }

  const rawAbilityDetails: unknown = await Promise.all(abilityDetailResponses.map((res) => res.json()));

  const abilityResult = AbilityArraySchema.safeParse(rawAbilityDetails);

  if (!abilityResult.success) {
    console.error(abilityResult.error);
    throw new Error("abilityレスポンスの形式が想定と異なります");
  }

  const abilityDetailsData = abilityResult.data;

  // species
  const speciesRes = await fetch(pokemonData.species.url);

  if (!speciesRes.ok) {
    throw new Error(`speciesの取得失敗: ${speciesRes.status}`);
  }
  const rawSpecies: unknown = await speciesRes.json();

  const speciesResult = SpeciesSchema.safeParse(rawSpecies);

  if (!speciesResult.success) {
    console.error(speciesResult.error);
    throw new Error("speciesレスポンスの形式が想定と異なります");
  }

  const speciesData = speciesResult.data;

  // 進化チェーン
  const evolutionChainRes = await fetch(speciesData.evolution_chain.url);

  if (!evolutionChainRes.ok) {
    throw new Error(`進化チェーンの取得失敗: ${evolutionChainRes.status}`);
  }

  const rawEvolutionChain: unknown = await evolutionChainRes.json();

  const evolutionChainResult = EvolutionChainSchema.safeParse(rawEvolutionChain);

  if (!evolutionChainResult.success) {
    console.error(evolutionChainResult.error);
    throw new Error("evolutionレスポンスの形式が想定と異なります");
  }

  const evolutionData = evolutionChainResult.data;

  /* ========================================
   データ整形
======================================== */

  // 進化チェーンから全ポケモン名を再帰取得
  const getEvolutionItems = (node: EvolutionNode): EvolutionItem[] => {
    const evolutionDetails = node.evolution_details.map((detail) => ({
      minLevel: detail.min_level,
      trigger: detail.trigger?.name ?? null,
      item: detail.item?.name ?? null,
    }));

    const evolutionItems = [
      {
        name: node.species.name,
        evolutionDetails,
      },
    ];

    for (const nextNode of node.evolves_to) {
      const nextItems = getEvolutionItems(nextNode);
      evolutionItems.push(...nextItems);
    }

    return evolutionItems;
  };

  const evolutionItems = getEvolutionItems(evolutionData.chain);

  const types = [...pokemonData.types].sort((a, b) => a.slot - b.slot).map((type) => type.type.name);

  const stats = pokemonData.stats.map((stat) => ({
    name: stat.stat.name,
    baseStat: stat.base_stat,
  }));

  // 特性の名前と説明文をインデックスで対応させる
  const abilityDetails = abilityDetailsData.map((abilityData) => {
    const description = abilityData.flavor_text_entries.filter((entry) => entry.language.name === "ja").at(-1)?.flavor_text ?? null;
    const jaName = abilityData.names.find((name) => name.language.name === "ja-hrkt")?.name ?? null;

    return { description, jaName };
  });

  const abilities = pokemonData.abilities.map((ability, index) => {
    const abilityDetail = abilityDetails[index] ?? null;
    return {
      name: abilityDetail?.jaName ?? null,
      isHidden: ability.is_hidden,
      description: abilityDetail?.description ?? null,
    };
  });

  return {
    id: pokemonData.id,
    name: pokemonData.name,
    imageUrl: pokemonData.sprites.other["official-artwork"].front_default,
    types,
    stats,
    abilities,
    evolutions: evolutionItems,
  };
};
