import { Outlet } from "react-router-dom";
import PokemonSearchForm from "../components/PokemonSearchForm";
import { useState } from "react";

const PokemonLayout = () => {
  const [pokemonName, setPokemonName] = useState<string | null>(null);

  const handleSearch = (name: string) => {
    setPokemonName(name);
  };

  return (
    <div>
      <PokemonSearchForm onSearch={handleSearch} />

      <Outlet context={{ pokemonName }} />
    </div>
  );
};

export default PokemonLayout;
