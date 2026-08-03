import type { PokemonSummary } from "../api/getPokemonOverview.js";
import { pokemonTypeMap } from "../lib/pokemonTypeMap.js";
import { Link } from "react-router-dom";

type Props = {
  items: PokemonSummary[];
};

export const PokemonOverviewList = ({ items }: Props) => {
  return (
    <ul>
      {items.map((pokemon) => (
        <li key={pokemon.id} className="leading-relaxed border border-slate-500 py-6 last:border-b-0">
          <h2>{pokemon.name}</h2>
          {pokemon.imageUrl && (
            <Link className="mx-auto block w-fit" to={`/pokemon/${pokemon.name}`}>
              <img className="pb-2" src={pokemon.imageUrl} alt={pokemon.name} width={256} />
            </Link>
          )}

          <p>
            タイプ：
            <span className="inline-flex gap-1 font-bold ">
              {pokemon.types.map((type) => {
                const typeInfo = pokemonTypeMap[type];

                return (
                  <span key={type} className={`${typeInfo.bgColorClass} rounded px-2 py-1 text-white`}>
                    {typeInfo.ja}
                  </span>
                );
              })}
            </span>
          </p>

          <div className="mx-auto grid w-fit grid-cols-[auto_auto] gap-x-4">
            <p>
              体長： <span className="font-bold text-slate-800 dark:text-white">{pokemon.height * 10}cm</span>
            </p>
            <p>
              重さ： <span className="font-bold text-slate-800 dark:text-white">{pokemon.weight / 10}kg</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PokemonOverviewList;
