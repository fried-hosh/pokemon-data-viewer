import { useParams } from "react-router-dom";

const PokemonDetailPage = () => {
  const { pokemonName } = useParams();

  return <p>{pokemonName}</p>;
};

export default PokemonDetailPage;
