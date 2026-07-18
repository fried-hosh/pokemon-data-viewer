import "./App.css";
import { Route, Routes } from "react-router-dom";
import PokemonOverviewPage from "./pages/PokemonOverviewPage";
import PokemonDetailPage from "./pages/PokemonDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PokemonOverviewPage />} />
      <Route path="/pokemon/:pokemonName" element={<PokemonDetailPage />} />
    </Routes>
  );
}

export default App;
