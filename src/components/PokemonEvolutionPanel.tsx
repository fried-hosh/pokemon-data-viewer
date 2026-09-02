import { useState } from "react";
import { getPokemonDetails, type EvolutionPath, type PokemonDetails } from "../api/getPokemonDetails";
import EvolutionBranch from "./EvolutionBranch";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MobileEvolutionBranch from "./MobileEvolutionBranch";

type EvolutionPanelProps = {
  details: PokemonDetails;
  panelClassName: string;
};
type EvolutionSelectStatus = "idle" | "pending" | "error";

const PokemonEvolutionPanel = ({ details, panelClassName }: EvolutionPanelProps) => {
  // 進化表選択時の 通常時, ロード中, 取得失敗時 の状態管理
  const [selectionStatus, setSelectionStatus] = useState<EvolutionSelectStatus>("idle");

  // 進化画像クリックで取得中と取得失敗時に画面遷移しないようにする
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handleEvolutionSelect = async (pokemonName: string) => {
    setSelectionStatus("pending");

    try {
      await queryClient.fetchQuery({
        queryKey: ["pokemonDetail", pokemonName],
        queryFn: () => getPokemonDetails(pokemonName),
        staleTime: Infinity,
      });
      // 成功したらURL変更
      navigate(`/pokemon/${pokemonName}`);
      setSelectionStatus("idle");
    } catch (error) {
      setSelectionStatus("error");
      console.error(`${pokemonName}の取得失敗`, error);
    }
  };

  const rootPokemonName = details.evolutionPaths[0]?.from.name ?? details.name;
  // 選択中のポケモンから根本までのパスを確保 / 線の着色用
  const selectedPaths: EvolutionPath[] = [];
  let currentName = details.name;
  let isFoundNextPath = true;
  while (isFoundNextPath) {
    isFoundNextPath = false;
    const foundPath = details.evolutionPaths.find((path) => path.to.name === currentName);
    if (foundPath) {
      isFoundNextPath = true;
      selectedPaths.push(foundPath);
      currentName = foundPath.from.name;
    }
  }

  return (
    <section className={panelClassName}>
      <h2 className="sr-only">進化表</h2>

      {/* スピナー */}
      <div className="flex min-h-6 justify-end" aria-live="polite">
        {selectionStatus === "pending" && (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" aria-hidden="true" />
            <span>更新中...</span>
          </span>
        )}
        {selectionStatus === "error" && <p className="text-red-500">取得に失敗しました</p>}
      </div>

      {/* 進化表 */}

      {/* モバイル版 */}
      <div className="lg:hidden">
        <ul>
          <MobileEvolutionBranch startPokemonName={rootPokemonName} evolutionPaths={details.evolutionPaths} evolutionArtworks={details.evolutionArtworks} onSelect={handleEvolutionSelect} isPending={selectionStatus === "pending"} selectedPokemonName={details.name} selectedPaths={selectedPaths} />
        </ul>
      </div>
      {/* PC版 */}
      <div className="hidden lg:block overflow-auto">
        <ul className="p-1 min-w-max lg:min-w-0">
          <EvolutionBranch startPokemonName={rootPokemonName} evolutionPaths={details.evolutionPaths} evolutionArtworks={details.evolutionArtworks} onSelect={handleEvolutionSelect} isPending={selectionStatus === "pending"} selectedPokemonName={details.name} selectedPaths={selectedPaths} />
        </ul>
      </div>
    </section>
  );
};

export default PokemonEvolutionPanel;
