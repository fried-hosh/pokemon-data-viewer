import { Outlet, useNavigate } from "react-router-dom";
import PokemonSearchForm from "../components/PokemonSearchForm";
import { pokemonSearchMap } from "../lib/pokemonSearchMap";

const PokemonLayout = () => {
  const navigate = useNavigate();

  const handleSearch = (name: string) => {
    if (!Object.hasOwn(pokemonSearchMap, name)) {
      return;
    }
    navigate(`/pokemon/${pokemonSearchMap[name]}`);
  };

  return (
    <div>
      <PokemonSearchForm onSearch={handleSearch} />

      <Outlet context={{ pokemonName: null }} />
    </div>
  );
};

export default PokemonLayout;
