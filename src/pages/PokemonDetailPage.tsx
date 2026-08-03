import { useParams } from "react-router-dom";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import PokemonDetailList from "../components/PokemonDetailList";

const PokemonDetailPage = () => {
  const { pokemonName } = useParams();
  const { data, isLoading, isError, isSuccess } = usePokemonDetails(pokemonName);

  return (
    <div>
      {isLoading && <p>読み込み中...</p>}
      {isError && <p className="text-red-200">取得に失敗しました</p>}

      {isSuccess && <PokemonDetailList details={data} />}
    </div>
  );
};

export default PokemonDetailPage;
