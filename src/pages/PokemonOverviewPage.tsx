import { PokemonOverviewList } from "../components/PokemonOverviewList.js";
import { usePokemonOverview } from "../hooks/usePokemonOverview.js";
import { useOutletContext } from "react-router-dom";

export type PokemonSearchContext = {
  pokemonName: string | null;
};
const PokemonOverviewPage = () => {
  const { pokemonName } = useOutletContext<PokemonSearchContext>();
  const pokemonInfo = usePokemonOverview(pokemonName);

  return (
    <div>
      {pokemonName !== null && pokemonInfo.isLoading && <p>読み込み中...</p>}

      {pokemonName !== null && pokemonInfo.isError && <p className="text-red-200">取得に失敗しました</p>}

      {pokemonName !== null && pokemonInfo.isSuccess && <PokemonOverviewList items={pokemonInfo.data} />}
    </div>
  );
};

export default PokemonOverviewPage;
