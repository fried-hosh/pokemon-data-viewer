import { useState } from "react";
import { getPokemonDetails, type PokemonDetails } from "../api/getPokemonDetails";
import EvolutionBranch from "./EvolutionBranch";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
  return (
    <section className={panelClassName}>
      <div className="flex justify-between">
        <h2>進化表</h2>

        {/* スピナー */}
        <div className="whitespace-nowrap" aria-live="polite">
          {selectionStatus === "pending" && (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" aria-hidden="true" />
              <span>更新中...</span>
            </span>
          )}
          {selectionStatus === "error" && <p className="text-red-500">取得に失敗しました</p>}
        </div>
      </div>

      {/* 進化表 */}
      <ul>
        <EvolutionBranch startPokemonName={rootPokemonName} evolutionPaths={details.evolutionPaths} evolutionArtworks={details.evolutionArtworks} onSelect={handleEvolutionSelect} isPending={selectionStatus === "pending"} />
      </ul>
    </section>
  );
};

export default PokemonEvolutionPanel;
