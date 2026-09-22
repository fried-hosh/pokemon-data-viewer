import { z } from "zod";
import { PokemonTypeSchema, type PokemonType } from "../lib/pokemonTypeMap";

/* ========================================
   スキーマ
======================================== */

export const PokemonMoveSchema = z.object({
  move: z.object({
    name: z.string(),
    url: z.string(),
  }),
  version_group_details: z.array(
    z.object({
      level_learned_at: z.number(),
      version_group: z.object({
        name: z.string(),
        url: z.string(),
      }),
      move_learn_method: z.object({
        name: z.string(),
      }),
    }),
  ),
});

const VersionGroupSchema = z.object({
  name: z.string(),
  order: z.number(),
});

const VersionGroupArraySchema = z.array(VersionGroupSchema);

const moveSchema = z.object({
  id: z.number(),
  accuracy: z.number().nullable(),
  pp: z.number(),
  power: z.number().nullable(),
  damage_class: z.object({
    name: z.enum(["physical", "special", "status"]),
  }),
  type: z.object({
    name: PokemonTypeSchema,
  }),
  names: z.array(
    z.object({
      name: z.string(),
      language: z.object({
        name: z.string(),
      }),
    }),
  ),
});

const moveArraySchema = z.array(moveSchema);

/* ========================================
   型
======================================== */
export type PokemonMoveItem = {
  // 選択した作品情報から取得
  displayVersionName: string;
  // MoveSchemaから取得
  id: number;
  jaName: string;
  type: PokemonType;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: "physical" | "special" | "status";
  // PokemonMoveSchemaから取得
  name: string;
  level: number | null;
  learnMethod: string;
};

type PokemonMoveData = z.infer<typeof PokemonMoveSchema>[];

/* ========================================
   データ取得 / 作品選択
======================================== */

export const getPokemonMoves = async (pokemonMoves: PokemonMoveData): Promise<PokemonMoveItem[]> => {
  // 習得する全ての技の登場世代のURLを列挙
  const versionGroupUrls = pokemonMoves.flatMap((pokemonMove) => pokemonMove.version_group_details.map((detail) => detail.version_group.url));
  const uniqueVersionGroupUrls = new Set(versionGroupUrls);

  // URLから作品名と作品順番号を取得 / 降順ソート / 最新 ~ USUM までの範囲指定
  const versionGroupResponses = await Promise.all([...uniqueVersionGroupUrls].map((url) => fetch(url)));
  for (const res of versionGroupResponses) {
    if (!res.ok) {
      throw new Error(`versionGroupの取得失敗: ${res.status}`);
    }
  }
  const rawVersionGroupResponses: unknown = await Promise.all(versionGroupResponses.map((res) => res.json()));

  const versionGroupResults = VersionGroupArraySchema.safeParse(rawVersionGroupResponses);
  if (!versionGroupResults.success) {
    console.error(versionGroupResults.error);
    throw new Error("versionGroupレスポンスの形式が想定と異なります");
  }

  const versionGroupData = versionGroupResults.data;

  // 当該ポケモンの登場作品の最新順
  const versionGroupsByNewest = [...versionGroupData].sort((a, b) => b.order - a.order);

  // PokeAPI全体のエンドポイントからUSUMの作品番号を取得
  const oldestVersionGroupName = "ultra-sun-ultra-moon";
  const oldestVersionGroupRes = await fetch(`https://pokeapi.co/api/v2/version-group/${oldestVersionGroupName}`);
  if (!oldestVersionGroupRes.ok) {
    throw new Error(`USUMの作品情報の取得失敗: ${oldestVersionGroupRes.status}`);
  }
  const rawOldestVersionGroup: unknown = await oldestVersionGroupRes.json();
  const oldestVersionGroupResult = VersionGroupSchema.safeParse(rawOldestVersionGroup);
  if (!oldestVersionGroupResult.success) {
    console.error(oldestVersionGroupResult.error);
    throw new Error("versionGroupレスポンスの形式が想定と異なります");
  }
  const oldestVersionGroupData = oldestVersionGroupResult.data;

  // 当該ポケモンの作品情報をUSUM以降に限定する / チャンピオンズを除外
  const supportedVersionGroups = versionGroupsByNewest.filter((versionGroup) => versionGroup.order >= oldestVersionGroupData.order && versionGroup.name !== "champions");

  // 今回表示する作品名を最新の1つに特定
  const targetVersionGroupName = supportedVersionGroups[0]?.name;

  if (targetVersionGroupName === undefined) {
    return [];
  }

  /* ========================================
   技データ整形 / 返り値用データ取得
======================================== */

  // 当該ポケモンの技リストをtargetVersionGroupNameを含むもののみに限定
  const latestPokemonMoves = pokemonMoves
    .filter((pokemonMove) => pokemonMove.version_group_details.some((detail) => detail.version_group.name === targetVersionGroupName))
    .map((pokemonMove) => ({
      ...pokemonMove,
      version_group_details: pokemonMove.version_group_details.filter((detail) => detail.version_group.name === targetVersionGroupName),
    }));

  // move.url から 日本語名, pp, 物理特殊区分 を取得
  const latestMoveResponses = await Promise.all(latestPokemonMoves.map((pokemonMove) => fetch(pokemonMove.move.url)));
  for (const res of latestMoveResponses) {
    if (!res.ok) {
      throw new Error(`move urlの取得失敗: ${res.status}`);
    }
  }
  const rawLatestMoves: unknown = await Promise.all(latestMoveResponses.map((res) => res.json()));
  const latestMovesResult = moveArraySchema.safeParse(rawLatestMoves);
  if (!latestMovesResult.success) {
    console.error(latestMovesResult.error);
    throw new Error("moveレスポンスの形式が想定と異なります");
  }
  const latestMovesData = latestMovesResult.data;

  // 返り値
  const displayVersionName = targetVersionGroupName;
  const pokemonMoveItems: PokemonMoveItem[] = latestMovesData.flatMap((data, index) => {
    const pokemonMove = latestPokemonMoves[index];
    if (pokemonMove === undefined) {
      throw new Error("技詳細と習得情報の対応が一致しません");
    }

    const id = data.id;
    const jaName = data.names.find((entry) => entry.language.name === "ja-hrkt")?.name ?? data.names.find((entry) => entry.language.name === "ja")?.name ?? pokemonMove.move.name;
    const type = data.type.name;
    const power = data.power;
    const accuracy = data.accuracy;
    const pp = data.pp;
    const damageClass = data.damage_class.name;
    const name = pokemonMove.move.name;

    return pokemonMove.version_group_details.map((detail) => {
      const learnMethod = detail.move_learn_method.name;
      const level = learnMethod === "level-up" ? detail.level_learned_at : null;

      return {
        displayVersionName,
        id,
        jaName,
        type,
        power,
        accuracy,
        pp,
        damageClass,
        name,
        level,
        learnMethod,
      };
    });
  });

  return pokemonMoveItems;
};
