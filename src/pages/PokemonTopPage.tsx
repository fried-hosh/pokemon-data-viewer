import { useState } from "react";
import { pokemonSearchMap } from "../lib/pokemonSearchMap";
import PokemonPickCard from "../components/PokemonPickCard";

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
  return (
    <div>
      <button type="button" onClick={() => setPicks(randomPick())}>
        引き直す
      </button>
      <ul className="flex flex-col md:flex-row justify-center w-full max-w-3xl mx-auto px-8 gap-2">
        {picks.map(([jaName, apiName]) => (
          <li key={apiName} className="flex-1 ">
            <PokemonPickCard jaName={jaName} apiName={apiName} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PokemonTopPage;
