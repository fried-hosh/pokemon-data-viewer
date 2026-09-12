import z from "zod";
import { PokemonTypeSchema, type PokemonType } from "../lib/pokemonTypeMap";

/* ========================================
   スキーマ
======================================== */
const typeRelationSchema = z.object({
  damage_relations: z.object({
    no_damage_from: z.array(
      z.object({
        name: PokemonTypeSchema,
      }),
    ),
    half_damage_from: z.array(
      z.object({
        name: PokemonTypeSchema,
      }),
    ),
    double_damage_from: z.array(
      z.object({
        name: PokemonTypeSchema,
      }),
    ),
  }),
});

const typeRelationSchemaArray = z.array(typeRelationSchema);

/* ========================================
   型
======================================== */

type TypeEffectivenessMultiplier = 0 | 0.25 | 0.5 | 2 | 4;

type SingleTypeMultiplier = 0 | 0.5 | 2;

type DamageRelationItem = {
  attackType: PokemonType;
  multiplier: SingleTypeMultiplier;
};

export type TypeEffectivenessGroup = {
  multiplier: TypeEffectivenessMultiplier;
  types: PokemonType[];
};

/* ========================================
   データ取得
======================================== */

// タイプ相性取得
export const getTypeEffectiveness = async (typeUrls: string[]): Promise<TypeEffectivenessGroup[]> => {
  const typeRes = await Promise.all(typeUrls.map((url) => fetch(url)));
  for (const res of typeRes) {
    if (!res.ok) {
      throw new Error(`type urlの取得失敗: ${res.status}`);
    }
  }
  const rawTypeRes: unknown = await Promise.all(typeRes.map((res) => res.json()));
  const typeRelationsResult = typeRelationSchemaArray.safeParse(rawTypeRes);
  if (!typeRelationsResult.success) {
    console.error(typeRelationsResult.error);
    throw new Error("typeRelationsレスポンスの形式が想定と異なります");
  }
  const typeRelationsData = typeRelationsResult.data;

  const doubleDamageTypes: DamageRelationItem[] = typeRelationsData
    .map((r) =>
      r.damage_relations.double_damage_from.map(
        (d): DamageRelationItem => ({
          attackType: d.name,
          multiplier: 2,
        }),
      ),
    )
    .flat();
  const halfDamageTypes: DamageRelationItem[] = typeRelationsData
    .map((r) =>
      r.damage_relations.half_damage_from.map(
        (d): DamageRelationItem => ({
          attackType: d.name,
          multiplier: 0.5,
        }),
      ),
    )
    .flat();
  const zeroDamageTypes: DamageRelationItem[] = typeRelationsData
    .map((r) =>
      r.damage_relations.no_damage_from.map(
        (d): DamageRelationItem => ({
          attackType: d.name,
          multiplier: 0,
        }),
      ),
    )
    .flat();

  const damageRelationItems: DamageRelationItem[] = [...doubleDamageTypes, ...halfDamageTypes, ...zeroDamageTypes];

  const typeRelationsMap = new Map<PokemonType, number>();

  for (const { attackType, multiplier } of damageRelationItems) {
    if (!typeRelationsMap.has(attackType)) {
      typeRelationsMap.set(attackType, multiplier);
    } else {
      const currentMultiplier = typeRelationsMap.get(attackType) ?? 1;
      const combinedMultiplier = currentMultiplier * multiplier;

      typeRelationsMap.set(attackType, combinedMultiplier);
    }
  }

  const multipliers: TypeEffectivenessMultiplier[] = [4, 2, 0.5, 0.25, 0];

  const groups: TypeEffectivenessGroup[] = multipliers.map((multiplier) => ({
    multiplier,
    types: [],
  }));

  // Mapのvalue === group.multiplier の場合、group.typeにMapのkeyをpush
  for (const [type, multiplier] of typeRelationsMap.entries()) {
    const targetGroup = groups.find((group) => group.multiplier === multiplier);
    targetGroup?.types.push(type);
  }

  return groups;
};
