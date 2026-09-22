import type { PokemonMoveItem } from "../api/getPokemonMoves";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";

// 習得方法 技区分 作品名の日本語化マップ
const learnMethodMap: Record<string, string> = {
  "level-up": "レベルアップ",
  machine: "わざマシン",
  egg: "タマゴ技",
  tutor: "技教え",
  train: "トレーニング",
};
const damageClassMap: Record<PokemonMoveItem["damageClass"], string> = {
  physical: "物理",
  special: "特殊",
  status: "変化",
};
const versionGroupMap: Record<string, string> = {
  "ultra-sun-ultra-moon": "ウルトラサン・ウルトラムーン",
  "lets-go-pikachu-lets-go-eevee": "Let's Go! ピカチュウ・Let's Go! イーブイ",
  "sword-shield": "ソード・シールド",
  "the-isle-of-armor": "鎧の孤島",
  "the-crown-tundra": "冠の雪原",
  "brilliant-diamond-shining-pearl": "ブリリアントダイヤモンド・シャイニングパール",
  "legends-arceus": "Pokémon LEGENDS アルセウス",
  "scarlet-violet": "スカーレット・バイオレット",
  "the-teal-mask": "碧の仮面",
  "the-indigo-disk": "藍の円盤",
  "legends-za": "Pokémon LEGENDS Z-A",
  "mega-dimension": "M次元ラッシュ",
  champions: "Pokémon Champions",
};

type PokemonMovesPanelProps = {
  pokemonMoves: PokemonMoveItem[] | null;
  panelClassName: string;
};

const PokemonMovesPanel = ({ pokemonMoves, panelClassName }: PokemonMovesPanelProps) => {
  const displayVersionName = pokemonMoves?.[0]?.displayVersionName;

  // 技一覧を習得方法ごとに集約
  const accumulatedMoves: Record<string, PokemonMoveItem[]> = {};
  if (pokemonMoves !== null) {
    for (const move of pokemonMoves) {
      if (!Object.hasOwn(accumulatedMoves, move.learnMethod)) {
        accumulatedMoves[move.learnMethod] = [move];
      } else {
        accumulatedMoves[move.learnMethod]?.push(move);
      }
    }
  }
  // "level-up" のレベルを昇順に変更
  const levelUpMoves = accumulatedMoves["level-up"];
  if (levelUpMoves !== undefined) {
    levelUpMoves.sort((a, b) => {
      if (a.level === null && b.level === null) {
        return 0;
      }
      if (a.level === null) {
        return -1;
      }
      if (b.level === null) {
        return 1;
      }
      return a.level - b.level;
    });
  }
  // チャンピオンズの技をタイプ順かつ威力昇順に変更
  const championsMoves = accumulatedMoves["train"];
  if (displayVersionName === "champions" && championsMoves !== undefined) {
    championsMoves.sort((a, b) => {
      const typeComparison = a.type.localeCompare(b.type);
      if (typeComparison !== 0) {
        return typeComparison;
      }
      if (a.power === null && b.power === null) {
        return 0;
      }
      if (a.power === null) {
        return 1;
      }
      if (b.power === null) {
        return -1;
      }
      return a.power - b.power;
    });
  }

  const accumulatedMovesArray = Object.entries(accumulatedMoves);

  // methodOrderの順番で並び替え / その他のカテゴリは最後尾に取得順
  const methodOrder = ["level-up", "machine", "egg", "tutor", "train"];
  const sortedAccumulatedMovesArray = [...accumulatedMovesArray].sort((a, b) => {
    const indexA = methodOrder.indexOf(a[0]);
    const indexB = methodOrder.indexOf(b[0]);

    const orderA = indexA === -1 ? methodOrder.length : indexA;
    const orderB = indexB === -1 ? methodOrder.length : indexB;

    return orderA - orderB;
  });

  return (
    <section className={`${panelClassName}`}>
      {/* タイトル 対象作品名 */}
      <div className="mb-3 flex justify-between items-center  border-slate-400">
        <h2>覚える技</h2>
        {pokemonMoves === null && <p className="text-red-200">技情報を取得できませんでした</p>}
        {displayVersionName !== undefined && <span className="font-bold">{`${versionGroupMap[displayVersionName] ?? displayVersionName}`}</span>}
      </div>

      {/* 技一覧 */}
      {/* スクロール領域 */}
      <div
        className="
      max-h-[60vh] overflow-y-auto p-2 shadow-inner
      rounded-lg border border-slate-300
      dark:border-slate-600 dark:bg-slate-900/20
      "
      >
        {sortedAccumulatedMovesArray.map(([learnMethod, moves]) => (
          <div key={learnMethod} className="pb-3 mb-3 border-b last:border-b-0 border-slate-400">
            {/* 習得カテゴリ */}
            <h3
              className="
              sticky top-0 z-10 py-2
              bg-slate-50/50 dark:bg-slate-900/50
              mb-3 border-l-3 border-amber-400 pl-3 font-semibold text-lg text-slate-800 dark:text-slate-300

              "
            >
              {learnMethodMap[learnMethod]}
            </h3>
            {moves.map((move) => (
              <div
                key={`${move.id}-${move.level ?? "no-level"}`}
                className="
                p-2 mb-2 shadow-sm border
                border-slate-400/70 bg-amber-100/40
                dark:border-amber-50/80 dark:bg-amber-100/4 rounded
                "
              >
                {/* 1段目 - レベル 技名 タイプ名 */}
                <div className="flex gap-3 items-center">
                  {learnMethod === "level-up" && <span className="w-12">Lv. {move.level} </span>}
                  <div className="flex flex-1 items-center justify-between ">
                    <span className="text-slate-700 dark:text-white">{move.jaName}</span>
                    <span className={`rounded-xl px-2 py-1 text-white text-sm ${pokemonTypeMap[move.type].bgColorClass}`}>{pokemonTypeMap[move.type].ja}</span>
                  </div>
                </div>
                {/* 2段目 - 技区分 威力 命中 PP*/}
                <div className="flex justify-between">
                  <span>{damageClassMap[move.damageClass]}</span>
                  <div className="flex gap-3">
                    <span>威力 {move.power ?? "-"}</span>
                    <span>命中 {move.accuracy ?? "-"}</span>
                    <span>PP {move.pp ?? "-"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PokemonMovesPanel;
