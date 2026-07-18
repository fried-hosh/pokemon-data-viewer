import { PokemonOverviewList } from "../components/PokemonOverviewList.js";
import { usePokemonOverview } from "../hooks/usePokemonOverview.js";

const PokemonOverviewPage = () => {
  const pokemonInfo = usePokemonOverview("ロトム");

  if (pokemonInfo.isPending) {
    return <p>読み込み中...</p>;
  }

  if (pokemonInfo.isError) {
    return <p className="text-red-200">取得に失敗しました</p>;
  }
  return <PokemonOverviewList items={pokemonInfo.data} />;
};

export default PokemonOverviewPage;
