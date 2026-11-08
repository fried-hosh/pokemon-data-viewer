import type { PokemonMoveItem } from "../api/getPokemonMoves";
import MoveCard from "./MoveCard";

// 習得方法 技区分 作品名の日本語化マップ
const learnMethodMap: Record<string, string> = {
  "level-up": "レベルアップ",
  machine: "わざマシン",
  egg: "タマゴ技",
  tutor: "技教え",
  train: "トレーニング",
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
  pokemonMoves: PokemonMoveItem[];
  panelClassName: string;
};

const PokemonMovesPanel = ({ pokemonMoves, panelClassName }: PokemonMovesPanelProps) => {
  const displayVersionName = pokemonMoves?.[0]?.displayVersionName;

  // 技一覧を習得方法ごとに集約
  const accumulatedMoves: Record<string, PokemonMoveItem[]> = {};
  for (const move of pokemonMoves) {
    if (!Object.hasOwn(accumulatedMoves, move.learnMethod)) {
      accumulatedMoves[move.learnMethod] = [move];
    } else {
      accumulatedMoves[move.learnMethod]?.push(move);
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
  const movesToSort = [accumulatedMoves["machine"]];
  if (displayVersionName === "champions") {
    movesToSort.push(accumulatedMoves["train"]);
  }
  for (const moves of movesToSort) {
    if (moves === undefined) {
      continue;
    }
    moves.sort((a, b) => {
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
      <div className="mb-3 flex justify-between items-center">
        <h2 className="hidden md:block">覚える技</h2>
        {displayVersionName !== undefined && <span className="font-bold ml-auto">{`${versionGroupMap[displayVersionName] ?? displayVersionName}`}</span>}
      </div>

      {/* 技一覧 */}
      {/* スクロール領域 */}
      <div
        className="
      max-h-[60vh] lg:max-h-none lg:flex-1 overflow-y-auto p-2 shadow-inner
      rounded-lg border border-olive-300
      dark:border-slate-600 dark:bg-slate-900/20
      "
      >
        {pokemonMoves.length === 0 ? (
          <p className="text-center text-olive-500 dark:text-slate-300">データが追加されていません</p>
        ) : (
          sortedAccumulatedMovesArray.map(([learnMethod, moves]) => (
            <div key={learnMethod} className="pb-3 mb-3 border-b last:border-b-0 border-olive-400 dark:border-slate-400">
              {/* 習得カテゴリ */}
              <h3
                className="
              sticky top-0 z-10 py-2
              bg-slate-50/50 dark:bg-slate-900/50
              mb-3 border-l-3 border-(--accent) pl-3 font-semibold text-lg text-olive-800 dark:text-slate-300
              "
              >
                {learnMethodMap[learnMethod]}
              </h3>
              {moves.map((move) => (
                // 技一件分
                <MoveCard key={`${move.id}-${move.level ?? "no-level"}`} move={move} />
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default PokemonMovesPanel;
