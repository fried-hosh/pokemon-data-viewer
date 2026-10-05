import { useCallback, useState } from "react";
import { pokemonSearchMap } from "../lib/pokemonSearchMap";
import PokemonPickCard from "../components/PokemonPickCard";

// 3匹ランダムで引く / 前回引いたポケモンは除外
const randomPick = (excludes: [string, string][] = []) => {
  const entries = Object.entries(pokemonSearchMap);

  const excludesNames = excludes.map(([, apiName]) => apiName);
  const uniqueThreePicks = new Set<[string, string]>();

  while (uniqueThreePicks.size < 3) {
    const randomLocation = Math.floor(Math.random() * entries.length);
    const picked = entries[randomLocation];
    if (picked !== undefined && !excludesNames.includes(picked[1])) {
      uniqueThreePicks.add(picked);
    }
  }

  return [...uniqueThreePicks];
};

const PokemonTopPage = () => {
  const [picks, setPicks] = useState(() => randomPick());
  // 引き直し前の3匹を記憶
  const [prevPicks, setPrevPicks] = useState<[string, string][]>([]);
  // 演出を終えたカードの apiName を記憶 / 引き直しで空に戻す
  const [openedCards, setOpenedCards] = useState<string[]>([]);

  const handleCardOpened = useCallback((apiName: string) => {
    setOpenedCards((prev) => [...prev, apiName]);
  }, []);

  const handleReroll = () => {
    setOpenedCards([]);
    setPrevPicks(picks);
    setPicks(randomPick(picks));
  };
  // 3匹のカードが全て演出を終えたかどうか。 件数ではなく名前で判断し、画面幅切り替え時のrotateによる重複した発火の影響を受けないようにする
  const isAllCardOpened = picks.every(([, apiName]) => openedCards.includes(apiName));

  return (
    <section className={`relative w-full max-w-3xl mx-auto mt-4 pt-8 pb-6 px-8 border rounded-2xl shadow-lg border-(--border) bg-(--code-bg)`}>
      {/* タイトル*/}
      <h3
        className={`
        absolute z-10 -top-4.5 left-8
        font-semibold text-pink-400 dark:text-amber-200 p-2 tracking-widest
        border rounded-full border-(--border) bg-(--code-bg)
        `}
      >
        PICK UP
      </h3>
      {/* カード */}
      <div className="flex flex-col gap-2">
        <ul className="flex flex-col md:flex-row justify-center gap-2">
          {picks.map(([jaName, apiName], index) => {
            const prevPick = prevPicks[index];
            return (
              // 親であるliのkeyがポケモンの名前だとほぼ毎回子ごと再描画されるため、引き直し前後で変わらないindexをkeyにする
              <li key={index} className="relative md:flex-1 h-32 md:h-70">
                {/* 引き直し押下後に作られる引き直し前のカード。 keyを apiName にすることで、元々あったカードと同じ要素として表示位置と状態を引き継ぐ */}
                {/* 最新のカードが全てめくれ次第アンマウント */}
                {prevPick !== undefined && !isAllCardOpened && <PokemonPickCard key={prevPick[1]} jaName={prevPick[0]} apiName={prevPick[1]} index={index} onFinished={handleCardOpened} />}

                {/* 初期表示 もしくは 新しく引いたカード。 初めて出るkeyのため新しく作られる  */}
                <PokemonPickCard key={apiName} jaName={jaName} apiName={apiName} index={index} onFinished={handleCardOpened} />
              </li>
            );
          })}
        </ul>
        {/* 引き直しボタン */}
        <button
          disabled={!isAllCardOpened}
          type="button"
          onClick={() => handleReroll()}
          className="group
        font-semibold text-slate-700 dark:text-slate-200 p-2 mt-2 self-center
        border-3 rounded-full border-amber-100/30 dark:border-(--border)/30 shadow-md
        transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-xl active:translate-y-0 active:scale-95
        disabled:opacity-60
        "
        >
          <span
            className={`
        text-pink-400 dark:text-amber-200 font-bold mr-1
        inline-block group-hover:rotate-360 transition-transform duration-300 ${!isAllCardOpened ? "animate-spin" : ""}
        `}
          >
            ↻
          </span>
          もういちど 引く
        </button>
      </div>
    </section>
  );
};

export default PokemonTopPage;
