import { useParams } from "react-router-dom";
import { usePokemonDetails } from "../hooks/usePokemonDetails";
import PokemonDetailList from "../components/PokemonDetailList";
import { usePokemonMoves } from "../hooks/usePokemonMoves";
import LoadingSpinner from "../components/LoadingSpinner";

const PokemonDetailPage = () => {
  const { pokemonName } = useParams();
  const { data: details, isLoading: isDetailsLoading, isError: isDetailsError, isSuccess: isDetailsSuccess } = usePokemonDetails(pokemonName);
  const { data: moves, isLoading: isMovesLoading, isError: isMovesError } = usePokemonMoves(details?.pokemonMoves ?? null);

  return (
    <div>
      {isDetailsLoading && (
        // 300ms以内に読み込みが終わればスピナーを表示しない（一瞬だけ表示されるちらつきを防ぐ）
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-detail-panel-fade-in [animation-delay:300ms]">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {isDetailsError && <p className="text-red-200">取得に失敗しました</p>}

      {isDetailsSuccess && <PokemonDetailList details={details} moves={moves} isMovesLoading={isMovesLoading} isMovesError={isMovesError} />}
    </div>
  );
};

export default PokemonDetailPage;
