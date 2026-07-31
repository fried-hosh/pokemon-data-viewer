import { useParams } from "react-router-dom";
import { usePokemonDetails } from "../hooks/usePokemonDetails";

const PokemonDetailPage = () => {
  const { pokemonName } = useParams();
  usePokemonDetails(pokemonName);

  return <p>{pokemonName}</p>;
};

export default PokemonDetailPage;
