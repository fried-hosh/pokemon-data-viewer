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
      <header className="flex items-center justify-between border-b-2 border-(--border) px-2">
        <button type="button" onClick={() => navigate(`/`)} className="ml-6 font-bold  md:text-xl cursor-pointer">
          <span className="text-slate-600 dark:text-amber-50">Peek</span>
          <span className="text-pink-400 dark:text-amber-500">Dex</span>
        </button>
        <PokemonSearchForm onSearch={handleSearch} />
      </header>

      <Outlet />
    </div>
  );
};

export default PokemonLayout;
