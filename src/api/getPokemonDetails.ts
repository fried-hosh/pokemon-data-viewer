// 名前、画像、タイプ、種族値(個別・合計)、特性
// 進化チェーン、進化レベル/手段（名前or画像クリックで該当ポケモンのDetailに遷移）
// タイプ相性
// 覚える技
import { z } from "zod";
import { type PokemonType } from "../lib/pokemonTypeMap";
import { PokemonTypeSchema } from "../lib/pokemonTypeMap";
import { getTypeEffectiveness, type TypeEffectivenessGroup } from "./getTypeEffectiveness";
import { getPokemonMoves, PokemonMoveSchema, type PokemonMoveItem } from "./getPokemonMoves";

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
  moves: z.array(PokemonMoveSchema),
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

// 進化条件
const NamedApiResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});

// 新しく追加されたフォルム情報
const PokemonFormSchema = z.object({
  pokemon: NamedApiResourceSchema,
});

const EvolutionDetailSchema = z.object({
  required_pokemon_form: NamedApiResourceSchema.nullable(),
  evolved_pokemon_form: NamedApiResourceSchema.nullable(),
  item: NamedApiResourceSchema.nullable(),
  held_item: NamedApiResourceSchema.nullable(),
  known_move: NamedApiResourceSchema.nullable(),
  known_move_type: NamedApiResourceSchema.nullable(),
  location: NamedApiResourceSchema.nullable(),
  party_species: NamedApiResourceSchema.nullable(),
  party_type: NamedApiResourceSchema.nullable(),
  region: NamedApiResourceSchema.nullable(),
  trade_species: NamedApiResourceSchema.nullable(),
  used_move: NamedApiResourceSchema.nullable(),
  trigger: NamedApiResourceSchema,
  gender: z.number().int().nullable(),
  min_affection: z.number().int().nullable(),
  min_beauty: z.number().int().nullable(),
  min_damage_taken: z.number().int().nullable(),
  min_happiness: z.number().int().nullable(),
  min_level: z.number().int().nullable(),
  min_move_count: z.number().int().nullable(),
  min_steps: z.number().int().nullable(),
  relative_physical_stats: z.number().int().nullable(),
  near_special_rock: z.boolean(),
  needs_multiplayer: z.boolean(),
  needs_overworld_rain: z.boolean(),
  turn_upside_down: z.boolean(),
  time_of_day: z.string(),
  // 代表的な進化条件かどうか(グレイシア: こおりのいし = true, ⚪︎⚪︎でレベルアップ = false)
  is_default: z.boolean(),
});

// アイテム・技・場所等の日本語名
const NamedApiResourceToJaSchema = z.object({
  names: z.array(
    z.object({
      language: z.object({ name: z.string() }),
      name: z.string(),
    }),
  ),
});

// 一件分の再帰スキーマ
const EvolutionNodeSchema = z.object({
  species: z.object({
    name: z.string(),
    url: z.string(),
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

// 進化表に使うスプライトのスキーマ
const EvolutionPokemonSchema = PokemonSchema.pick({
  name: true,
  sprites: true,
});
const EvolutionChainArraySchema = z.array(EvolutionPokemonSchema);

/* ========================================
   型
======================================== */
type SpeciesData = z.infer<typeof SpeciesSchema>;
type EvolutionNode = z.infer<typeof EvolutionNodeSchema>;
type NamedApiResource = z.infer<typeof NamedApiResourceSchema>;

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
  evolutionPaths: EvolutionPath[];
  evolutionArtworks: EvolutionArtwork[];
  typeEffectiveness: TypeEffectivenessGroup[] | null;
  pokemonMoves: PokemonMoveItem[] | null;
};

type NamedApiResourceWithJa = {
  name: string;
  jaName: string;
};

export type EvolutionConditions = {
  item: NamedApiResourceWithJa | null;
  heldItem: NamedApiResourceWithJa | null;
  knownMove: NamedApiResourceWithJa | null;
  knownMoveType: NamedApiResourceWithJa | null;
  location: NamedApiResourceWithJa | null;
  partySpecies: NamedApiResourceWithJa | null;
  partyType: NamedApiResourceWithJa | null;
  region: NamedApiResourceWithJa | null;
  tradeSpecies: NamedApiResourceWithJa | null;
  usedMove: NamedApiResourceWithJa | null;
  trigger: NamedApiResource;
  gender: number | null;
  minAffection: number | null;
  minBeauty: number | null;
  minDamageTaken: number | null;
  minHappiness: number | null;
  minLevel: number | null;
  minMoveCount: number | null;
  minSteps: number | null;
  relativePhysicalStats: number | null;
  nearSpecialRock: boolean;
  needsMultiplayer: boolean;
  needsOverworldRain: boolean;
  turnUpsideDown: boolean;
  timeOfDay: string;
};
// 原種null解決後に使うフォーム型
type PokemonReference = {
  name: string;
  url: string;
};
// 原種のnullを解決するまでに使うフォーム型
type FormInfo = PokemonReference | null;
// 進化チェーンの線
export type EvolutionPath = {
  from: PokemonReference;
  to: PokemonReference;
  evoDetails: EvolutionConditions[];
};

export type EvolutionArtwork = {
  name: string;
  sprite: string | null;
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

  // タイプ相性データ取得
  const typeUrls = pokemonData.types.map((type) => type.type.url);
  let typeEffectiveness: TypeEffectivenessGroup[] | null = null;
  try {
    // 成功した場合のみ相性データへ置き換え
    typeEffectiveness = await getTypeEffectiveness(typeUrls);
  } catch (error) {
    // 失敗した場合はnullのまま詳細画面の取得を続ける
    console.error("タイプ相性の取得に失敗しました", error);
  }

  // 技データ取得
  let pokemonMoves: PokemonMoveItem[] | null = null;
  try {
    pokemonMoves = await getPokemonMoves(pokemonData.moves);
  } catch (error) {
    console.error("技の取得に失敗しました", error);
  }

  /* ========================================
   データ整形
======================================== */
  const getDefaultPokemon = (speciesData: SpeciesData) => {
    const defaultPokemon = speciesData.varieties.find((variety) => variety.is_default)?.pokemon ?? null;

    return defaultPokemon;
  };

  const getDefaultPokemonFromSpeciesUrl = async (speciesUrl: string) => {
    const defaultSpeciesRes = await fetch(speciesUrl);
    if (!defaultSpeciesRes.ok) {
      // ページ全体の取得を失敗させないためにthrowしない
      return null;
    }
    const rawDefaultSpeciesRes: unknown = await defaultSpeciesRes.json();
    const defaultSpeciesResult = SpeciesSchema.safeParse(rawDefaultSpeciesRes);
    if (!defaultSpeciesResult.success) {
      console.error(defaultSpeciesResult.error);
      return null;
    }
    const defaultSpeciesData = defaultSpeciesResult.data;

    return getDefaultPokemon(defaultSpeciesData);
  };

  /**
   * PokemonFormを取得・検証し、その中のpokemonの名前とURLを返す。
   *
   * @param formUrl フォーム情報の取得先URL
   * @returns ポケモンのnameと取得先URL
   */
  const getPokemonreferenceFromForm = async (formUrl: string | undefined): Promise<PokemonReference | null> => {
    if (formUrl === undefined) {
      return null;
    }

    const formRes = await fetch(formUrl);
    if (!formRes.ok) {
      throw new Error(`formの取得失敗: ${formRes.status}`);
    }
    const rawFormRes: unknown = await formRes.json();
    const formResult = PokemonFormSchema.safeParse(rawFormRes);
    if (!formResult.success) {
      console.error(formResult.error);
      throw new Error("formレスポンスの形式が想定と異なります");
    }
    const formData = formResult.data;
    return formData.pokemon;
  };

  /**
   * フォルムポケモンならformのURLをそのまま使う。
   * 原種ポケモンではnullになるため、speciesからpokemonを取得 -> default(原種)データを取得。
   *
   * 取得したnameはフォルム別の進化経路判定に、
   * urlは進化表のアートワーク取得に使う。
   *
   * @param form ポケモンの名前と取得先URL。フォーム指定がない場合はnull
   * @param speciesUrl 原種ポケモンのPokemon情報に辿り着くためのspecies URL
   * @returns Pokemonの{name, url}。原種の補完に失敗した場合はnull
   */
  const resolvePokemonReference = async (form: FormInfo, speciesUrl: string) => {
    if (form !== null) {
      return form;
    }

    return getDefaultPokemonFromSpeciesUrl(speciesUrl);
  };

  // 日本語名を取り出す
  const getLocalizedResource = async (resource: NamedApiResource | null): Promise<NamedApiResourceWithJa | null> => {
    if (resource === null) {
      return null;
    }
    const fallbackResource: NamedApiResourceWithJa = {
      name: resource.name,
      jaName: resource.name,
    };
    const jaNameRes = await fetch(resource.url);
    if (!jaNameRes.ok) {
      console.error("進化条件の日本語名を取得できませんでした");
      return fallbackResource;
    }
    const rawJaNameRes: unknown = await jaNameRes.json();
    const jaNameResult = NamedApiResourceToJaSchema.safeParse(rawJaNameRes);
    if (!jaNameResult.success) {
      console.error(jaNameResult.error);
      return fallbackResource;
    }
    const jaNameData = jaNameResult.data;

    const jaName = jaNameData.names.find((name) => name.language.name === "ja-hrkt") ?? null;
    return {
      name: resource.name,
      jaName: jaName?.name ?? resource.name,
    };
  };

  // 進化チェーンから全ポケモン名を再帰取得
  const getEvolutionItems = async (node: EvolutionNode): Promise<EvolutionPath[]> => {
    // nodeから直接進化する各分岐を並列処理し、すべての完了を待つ
    const results = await Promise.all(
      node.evolves_to.map(async (nextNode) => {
        const currentPath: EvolutionPath[] = [];

        for (const detail of nextNode.evolution_details) {
          // メインシリーズ以外の進化条件(evolution_details)を省く
          if (!detail.is_default) {
            continue;
          }

          // フォルムの取得先を取り出す
          const requiredFormUrl = detail.required_pokemon_form?.url;
          const evolvedFormUrl = detail.evolved_pokemon_form?.url;
          const [requiredForm, evolvedForm] = await Promise.all([getPokemonreferenceFromForm(requiredFormUrl), getPokemonreferenceFromForm(evolvedFormUrl)]);

          // 進化元と進化先を並列取得
          const [fromPokemon, toPokemon] = await Promise.all([resolvePokemonReference(requiredForm, node.species.url), resolvePokemonReference(evolvedForm, nextNode.species.url)]);

          // 原種のvarieties isDefault取得に失敗した場合
          if (fromPokemon === null || toPokemon === null) {
            continue;
          }

          // 日本語化対象の進化条件を並列取得
          const [item, heldItem, knownMove, knownMoveType, location, partySpecies, partyType, region, tradeSpecies, usedMove] = await Promise.all([
            getLocalizedResource(detail.item),
            getLocalizedResource(detail.held_item),
            getLocalizedResource(detail.known_move),
            getLocalizedResource(detail.known_move_type),
            getLocalizedResource(detail.location),
            getLocalizedResource(detail.party_species),
            getLocalizedResource(detail.party_type),
            getLocalizedResource(detail.region),
            getLocalizedResource(detail.trade_species),
            getLocalizedResource(detail.used_move),
          ]);

          const conditions: EvolutionConditions = {
            item,
            heldItem,
            knownMove,
            knownMoveType,
            location,
            partySpecies,
            partyType,
            region,
            tradeSpecies,
            usedMove,
            trigger: detail.trigger,
            gender: detail.gender,
            minAffection: detail.min_affection,
            minBeauty: detail.min_beauty,
            minDamageTaken: detail.min_damage_taken,
            minHappiness: detail.min_happiness,
            minLevel: detail.min_level,
            minMoveCount: detail.min_move_count,
            minSteps: detail.min_steps,
            relativePhysicalStats: detail.relative_physical_stats,
            nearSpecialRock: detail.near_special_rock,
            needsMultiplayer: detail.needs_multiplayer,
            needsOverworldRain: detail.needs_overworld_rain,
            turnUpsideDown: detail.turn_upside_down,
            timeOfDay: detail.time_of_day,
          };
          // 今回のfrom,toが既存のパスのfrom,toと一致するかを調べる
          // ヤバチャ系は条件だけが異なる同名from,toを持つパスが複数返ってくるため、一致した場合は条件文だけをpushしたい
          const existingPath = currentPath.find((path) => path.from.name === fromPokemon.name && path.to.name === toPokemon.name);
          if (existingPath) {
            existingPath.evoDetails.push(conditions);
          } else {
            // 大多数のポケモン or ヤバチャ系一周目
            currentPath.push({
              from: fromPokemon,
              to: toPokemon,
              evoDetails: [conditions],
            });
          }
        }
        const nextPaths = await getEvolutionItems(nextNode);
        return [...currentPath, ...nextPaths];
      }),
    );
    return results.flat();
  };

  const evolutionPaths = await getEvolutionItems(evolutionData.chain);

  // 作成したevolutionPathsの中から選択中のフォルムに関連するチェーンを絞り込む
  // 原種ニャースを検索した場合、アローラ、ガラルのフォルムを省く
  const connectedPokemonNames = new Set<string>([pokemonData.name]);
  const selectedEvolutionPaths = new Set<EvolutionPath>();

  let foundNewPath = true;
  while (foundNewPath) {
    foundNewPath = false;

    for (const path of evolutionPaths) {
      const isIncludeForm = connectedPokemonNames.has(path.from.name) || connectedPokemonNames.has(path.to.name);

      // ヒトカゲ -> リザード, リザード -> リザードン, リザードン -> ... を探す
      // whileの二周目で前半の条件が引っかかって終了する
      if (!selectedEvolutionPaths.has(path) && isIncludeForm) {
        selectedEvolutionPaths.add(path);
        connectedPokemonNames.add(path.from.name);
        connectedPokemonNames.add(path.to.name);

        foundNewPath = true;
      }
    }
  }
  // パスの並びをSetの発見順から正しい順番に直す
  const selectedEvolutionPathArray = evolutionPaths.filter((path) => selectedEvolutionPaths.has(path));

  // pathのurlからpokemonをfetchしてアートワークを取得
  let evolutionArtworks: EvolutionArtwork[];
  const selectedEvolutionPathArrayUrls = selectedEvolutionPathArray.flatMap((path) => [path.from.url, path.to.url]);
  const uniqueEvoPathUrls = [...new Set(selectedEvolutionPathArrayUrls)];
  // 無進化ポケモンの場合はfetchせずpokemonDataから取り出す
  if (uniqueEvoPathUrls.length === 0) {
    evolutionArtworks = [
      {
        name: pokemonData.name,
        sprite: pokemonData.sprites.other["official-artwork"].front_default,
      },
    ];
  } else {
    const pokemonArtworkRes = await Promise.all(uniqueEvoPathUrls.map((url) => fetch(url)));
    for (const res of pokemonArtworkRes) {
      if (!res.ok) {
        throw new Error(`進化表用pokemonの取得失敗: ${res.status}`);
      }
    }
    const rawPokemonArtworks: unknown = await Promise.all(pokemonArtworkRes.map((res) => res.json()));
    const pokemonArtworkResults = EvolutionChainArraySchema.safeParse(rawPokemonArtworks);
    if (!pokemonArtworkResults.success) {
      console.error(pokemonArtworkResults.error);
      throw new Error("pokemonレスポンスの形式が想定と異なります");
    }
    const pokemonArtworkData = pokemonArtworkResults.data;
    evolutionArtworks = pokemonArtworkData.map((data) => ({
      name: data.name,
      sprite: data.sprites.other["official-artwork"].front_default,
    }));
  }

  // タイプ整形

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
    evolutionPaths: selectedEvolutionPathArray,
    evolutionArtworks: evolutionArtworks,
    typeEffectiveness,
    pokemonMoves,
  };
};
