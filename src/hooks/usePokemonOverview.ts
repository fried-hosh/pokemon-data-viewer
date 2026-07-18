import { useQuery } from "@tanstack/react-query";
import { getPokemonOverview } from "../api/getPokemonOverview";
export const usePokemonOverview = (name: string) => {
  return useQuery({
    queryKey: ["pokemonOverview", name],
    queryFn: () => getPokemonOverview(name),
    staleTime: Infinity,
    gcTime: 300000,
  });
};
