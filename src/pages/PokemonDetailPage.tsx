import { useParams } from "react-router-dom";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import PokemonDetailList from "../components/PokemonDetailList";
import { usePokemonMoves } from "../hooks/usePokemonMoves";

const PokemonDetailPage = () => {
  const { pokemonName } = useParams();
  const { data: details, isLoading: isDetailsLoading, isError: isDetailsError, isSuccess: isDetailsSuccess } = usePokemonDetails(pokemonName);
  const { data: moves, isLoading: isMovesLoading, isError: isMovesError } = usePokemonMoves(details?.pokemonMoves ?? null);

  return (
    <div>
      {isDetailsLoading && <p>読み込み中...</p>}
      {isDetailsError && <p className="text-red-200">取得に失敗しました</p>}

      {isDetailsSuccess && <PokemonDetailList details={details} moves={moves} isMovesLoading={isMovesLoading} isMovesError={isMovesError} />}
    </div>
  );
};

export default PokemonDetailPage;
