import { skipToken, useQuery } from "@tanstack/react-query";
import { getPokemonCard } from "../api/getPokemonCard";
export const usePokemonCard = (name: string | null) => {
  return useQuery({
    queryKey: ["pokemonCard", name],
    queryFn: name === null ? skipToken : () => getPokemonCard(name),
    staleTime: Infinity,
    gcTime: 3000000,
  });
};
