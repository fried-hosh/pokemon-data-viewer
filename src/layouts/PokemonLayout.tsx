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
      <header className="flex items-center justify-center">
        <button type="button" onClick={() => navigate(`/`)} className="ml-6">
          TOP
        </button>
        <PokemonSearchForm onSearch={handleSearch} />
      </header>

      <Outlet />
    </div>
  );
};

export default PokemonLayout;
