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
      <header
        className="grid grid-cols-[1fr_4fr] px-2
        bg-olive-350 dark:bg-(--code-bg)
      "
      >
        <button type="button" onClick={() => navigate(`/`)} className="justify-self-start ml-2 font-bold  md:text-xl cursor-pointer">
          <span className="text-slate-600 dark:text-amber-50">Peek</span>
          <span className="text-pink-400 dark:text-amber-500">Dex</span>
        </button>
        <div className="justify-self-end">
          <PokemonSearchForm onSearch={handleSearch} />
        </div>
      </header>

      <Outlet />
    </div>
  );
};

export default PokemonLayout;
