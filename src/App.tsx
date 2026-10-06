import "./App.css";
import { Route, Routes } from "react-router-dom";
import PokemonDetailPage from "./pages/PokemonDetailPage";
import PokemonLayout from "./layouts/PokemonLayout";
import PokemonTopPage from "./pages/PokemonTopPage";

function App() {
  return (
    <Routes>
      <Route element={<PokemonLayout />}>
        <Route path="/" element={<PokemonTopPage />} />

        <Route path="/pokemon/:pokemonName" element={<PokemonDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
