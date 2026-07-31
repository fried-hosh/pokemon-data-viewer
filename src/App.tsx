import "./App.css";
import { Route, Routes } from "react-router-dom";
import PokemonOverviewPage from "./pages/PokemonOverviewPage";
import PokemonDetailPage from "./pages/PokemonDetailPage";
import PokemonLayout from "./layouts/PokemonLayout";

function App() {
  return (
    <Routes>
      <Route element={<PokemonLayout />}>
        <Route path="/" element={<PokemonOverviewPage />} />

        <Route path="/pokemon/:pokemonName" element={<PokemonDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
