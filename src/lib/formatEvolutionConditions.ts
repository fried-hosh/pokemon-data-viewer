import type { EvolutionConditions } from "../api/getPokemonDetails";

type FormattedConditions = {
  key: keyof EvolutionConditions;
  label: string;
  value: string;
};

const triggerLabels: Record<string, string> = {
  "level-up": "レベルアップ",
  trade: "通信交換",
  "use-item": "アイテムを使用",
  shed: "進化時に別のポケモンが発生",
  spin: "回転する",
  "tower-of-darkness": "あくの塔を選択",
  "tower-of-waters": "みずの塔を選択",
  "three-critical-hits": "1回の戦闘で急所に3回当てる",
  "take-damage": "戦闘でダメージを受ける",
  other: "その他の方法",
  "agile-style-move": "早業で技を使う",
  "strong-style-move": "力業で技を使う",
  "recoil-damage": "反動ダメージを受ける",
  "use-move": "特定の技を使う",
  "three-defeated-bisharp": "かしらのしるしを持つキリキザンを3匹倒す",
  "gimmighoul-coins": "コレクレーのコインを999枚集める",
};

const relativePhysicalLabels: Record<number, string> = {
  1: "攻撃 > 防御",
  0: "攻撃 = 防御",
  [-1]: "攻撃 < 防御",
};

const timeOfDayLabels: Record<string, string> = {
  day: "昼",
  night: "夜",
  dusk: "夕暮れ",
  "full-moon": "満月",
};

const genderLabels: Record<number, string> = {
  1: "メス",
  2: "オス",
  3: "性別なし",
};

export const formatEvolutionConditions = (conditions: EvolutionConditions | null): FormattedConditions[] => {
  if (conditions === null) {
    return [];
  }

  const formattedConditions: FormattedConditions[] = [];
  formattedConditions.push({
    key: "trigger",
    label: "進化方法",
    value: triggerLabels[conditions.trigger.name] ?? conditions.trigger.name,
  });
  if (conditions.item !== null) {
    formattedConditions.push({
      key: "item",
      label: "使用アイテム",
      value: conditions.item.jaName,
    });
  }
  if (conditions.heldItem !== null) {
    formattedConditions.push({
      key: "heldItem",
      label: "持ち物",
      value: conditions.heldItem.jaName,
    });
  }
  if (conditions.knownMove !== null) {
    formattedConditions.push({
      key: "knownMove",
      label: "覚えている技",
      value: conditions.knownMove.jaName,
    });
  }
  if (conditions.knownMoveType !== null) {
    formattedConditions.push({
      key: "knownMoveType",
      label: "覚えている技のタイプ",
      value: conditions.knownMoveType.jaName,
    });
  }
  if (conditions.location !== null) {
    formattedConditions.push({
      key: "location",
      label: "場所",
      value: conditions.location.jaName,
    });
  }
  if (conditions.partySpecies !== null) {
    formattedConditions.push({
      key: "partySpecies",
      label: "手持ちのポケモン",
      value: conditions.partySpecies.jaName,
    });
  }
  if (conditions.partyType !== null) {
    formattedConditions.push({
      key: "partyType",
      label: "手持ちのタイプ",
      value: conditions.partyType.jaName,
    });
  }
  if (conditions.region !== null) {
    formattedConditions.push({
      key: "region",
      label: "地方",
      value: conditions.region.jaName,
    });
  }
  if (conditions.tradeSpecies !== null) {
    formattedConditions.push({
      key: "tradeSpecies",
      label: "交換相手",
      value: conditions.tradeSpecies.jaName,
    });
  }
  if (conditions.usedMove !== null) {
    formattedConditions.push({
      key: "usedMove",
      label: "使用する技",
      value: conditions.usedMove.jaName,
    });
  }

  if (conditions.gender !== null) {
    formattedConditions.push({
      key: "gender",
      label: "性別",
      value: genderLabels[conditions.gender] ?? conditions.gender.toString(),
    });
  }
  if (conditions.minAffection !== null) {
    formattedConditions.push({
      key: "minAffection",
      label: "なかよし度",
      value: `${conditions.minAffection}以上`,
    });
  }
  if (conditions.minBeauty !== null) {
    formattedConditions.push({
      key: "minBeauty",
      label: "うつくしさ",
      value: `${conditions.minBeauty}以上`,
    });
  }
  if (conditions.minDamageTaken !== null) {
    formattedConditions.push({
      key: "minDamageTaken",
      label: "受けたダメージ",
      value: `${conditions.minDamageTaken}以上`,
    });
  }
  if (conditions.minHappiness !== null) {
    formattedConditions.push({
      key: "minHappiness",
      label: "なつき度",
      value: `${conditions.minHappiness}以上`,
    });
  }
  if (conditions.minLevel !== null) {
    formattedConditions.push({
      key: "minLevel",
      label: "必要レベル",
      value: `${conditions.minLevel}以上`,
    });
  }
  if (conditions.minMoveCount !== null) {
    formattedConditions.push({
      key: "minMoveCount",
      label: "使用回数",
      value: `${conditions.minMoveCount}回以上`,
    });
  }
  if (conditions.minSteps !== null) {
    formattedConditions.push({
      key: "minSteps",
      label: "必要歩数",
      value: `${conditions.minSteps}歩以上`,
    });
  }
  if (conditions.relativePhysicalStats !== null) {
    formattedConditions.push({
      key: "relativePhysicalStats",
      label: "攻撃と防御の関係",
      value: relativePhysicalLabels[conditions.relativePhysicalStats] ?? conditions.relativePhysicalStats.toString(),
    });
  }
  if (conditions.nearSpecialRock) {
    formattedConditions.push({
      key: "nearSpecialRock",
      label: "進化岩",
      value: "特殊な岩の近く",
    });
  }
  if (conditions.needsMultiplayer) {
    formattedConditions.push({
      key: "needsMultiplayer",
      label: "マルチプレイ",
      value: "必要",
    });
  }
  if (conditions.needsOverworldRain) {
    formattedConditions.push({
      key: "needsOverworldRain",
      label: "天候",
      value: "雨",
    });
  }
  if (conditions.turnUpsideDown) {
    formattedConditions.push({
      key: "turnUpsideDown",
      label: "ゲーム機の向き",
      value: "上下逆さにする",
    });
  }
  if (conditions.timeOfDay !== "") {
    formattedConditions.push({
      key: "timeOfDay",
      label: "時間帯",
      value: timeOfDayLabels[conditions.timeOfDay] ?? conditions.timeOfDay,
    });
  }

  return formattedConditions;
};
