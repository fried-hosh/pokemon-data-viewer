import { skipToken, useQuery } from "@tanstack/react-query";
import { getPokemonOverview } from "../api/getPokemonOverview";
export const usePokemonOverview = (name: string | null) => {
  return useQuery({
    queryKey: ["pokemonOverview", name],
    queryFn: name === null ? skipToken : () => getPokemonOverview(name),
    staleTime: Infinity,
    gcTime: 300000,
  });
};
