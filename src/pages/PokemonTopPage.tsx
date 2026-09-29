import { useState } from "react";
import { pokemonSearchMap } from "../lib/pokemonSearchMap";
import PokemonPickCard from "../components/PokemonPickCard";
import { useIsFetching } from "@tanstack/react-query";

// 3匹ランダムで引く
const randomPick = () => {
  const entries = Object.entries(pokemonSearchMap);
  const uniqueThreePicks = new Set<[string, string]>();
  while (uniqueThreePicks.size < 3) {
    const randomLocation = Math.floor(Math.random() * entries.length);
    const picked = entries[randomLocation];
    if (picked !== undefined) {
      uniqueThreePicks.add(picked);
    }
  }

  return [...uniqueThreePicks];
};

const PokemonTopPage = () => {
  const [picks, setPicks] = useState(() => randomPick());
  const fetchingCount = useIsFetching({ queryKey: ["pokemonCard"] });
  const isFetching = fetchingCount > 0;

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
          {picks.map(([jaName, apiName]) => (
            <li key={apiName} className="flex-1 ">
              <PokemonPickCard jaName={jaName} apiName={apiName} />
            </li>
          ))}
        </ul>
        {/* 引き直しボタン */}
        <button
          disabled={isFetching}
          type="button"
          onClick={() => setPicks(randomPick())}
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
        inline-block group-hover:rotate-360 transition-transform duration-300 ${isFetching ? "animate-spin" : ""}
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
