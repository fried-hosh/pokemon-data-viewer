import { skipToken, useQuery } from "@tanstack/react-query";
import { getPokemonMoves, type PokemonMoveData } from "../api/getPokemonMoves";

export const usePokemonMoves = (moves: PokemonMoveData | null) => {
  return useQuery({
    queryKey: ["pokemonMoves", moves],
    queryFn: !moves ? skipToken : () => getPokemonMoves(moves),
    staleTime: Infinity,
    gcTime: 300000,
  });
};
