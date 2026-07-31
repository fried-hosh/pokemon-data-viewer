import { skipToken, useQuery } from "@tanstack/react-query";
import { getPokemonDetails } from "../api/getPokemonDetails";

export const usePokemonDetails = (name: string | undefined) => {
  return useQuery({
    queryKey: ["pokemonDetail", name],
    queryFn: name === undefined ? skipToken : () => getPokemonDetails(name),
    staleTime: Infinity,
    gcTime: 300000,
  });
};
