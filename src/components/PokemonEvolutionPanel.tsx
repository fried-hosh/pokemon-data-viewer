import { useEffect, useState, type RefObject } from "react";
import { getPokemonDetails, type EvolutionPath, type PokemonDetails } from "../api/getPokemonDetails";
import EvolutionBranch from "./EvolutionBranch";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MobileEvolutionBranch from "./MobileEvolutionBranch";

type EvolutionPanelProps = {
  details: PokemonDetails;
  panelClassName: string;
  mobileDialogRef: RefObject<HTMLDialogElement | null>;
};
type EvolutionSelectStatus = "idle" | "pending" | "error";

const PokemonEvolutionPanel = ({ details, panelClassName, mobileDialogRef }: EvolutionPanelProps) => {
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
        // オフライン中も取得を試行 / 失敗したら即座にcatchで通知
        networkMode: "always",
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

  // モーダル表示中にlg遷移でclose()
  useEffect(() => {
    // 64rem = 1024px = lgサイズ
    const pcMedia = window.matchMedia("(min-width:64rem)");
    const closeOnPc = () => {
      if (pcMedia.matches) {
        mobileDialogRef.current?.close();
      }
    };
    closeOnPc();

    // 幅変更を監視
    pcMedia.addEventListener("change", closeOnPc);
    return () => {
      pcMedia.removeEventListener("change", closeOnPc);
    };
  }, [mobileDialogRef]);

  return (
    <>
      {/* モバイル版 */}
      <dialog
        aria-label="進化表"
        ref={mobileDialogRef}
        className={`
        ${panelClassName}
        lg:hidden m-auto pt-1 px-0 py-0 pb-0 rounded-2xl border-3
        backdrop:bg-black/40 backdrop:backdrop-blur-[2px]
        open:flex flex-col overflow-hidden
        open:transform-[scale(1)]
        starting:open:transform-[scale(0.90)]
        transition
        transition-discrete
        duration-200
        ease-out
        motion-reduce:transition-none
        `}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;

          const rect = event.currentTarget.getBoundingClientRect();
          const isOutside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;

          if (isOutside) {
            event.currentTarget.close();
          }
        }}
      >
        <div className="min-h-0 overflow-auto px-4 pb-0">
          <ul>
            <MobileEvolutionBranch startPokemonName={rootPokemonName} evolutionPaths={details.evolutionPaths} evolutionArtworks={details.evolutionArtworks} onSelect={handleEvolutionSelect} isPending={selectionStatus === "pending"} selectedPokemonName={details.name} selectedPaths={selectedPaths} />
          </ul>
          {/* 閉じるエリア */}
          <div className="w-full mt-3 border-t border-slate-400 dark:border-slate-400 ">
            <button type="button" className="pt-2 pb-2 w-full text-center " onClick={() => mobileDialogRef.current?.close()}>
              閉じる
            </button>
          </div>
        </div>
        {/* スピナー */}
        <div className="pointer-events-none absolute top-2 right-2 z-20" aria-live="polite">
          {selectionStatus === "pending" && (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" aria-hidden="true" />
              <span>更新中...</span>
            </span>
          )}
          {selectionStatus === "error" && <p className="text-red-500">取得失敗</p>}
        </div>
      </dialog>

      {/* PC版 */}

      <section className={`hidden lg:block ${panelClassName}`}>
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

        <h2 className="sr-only">進化表</h2>

        <div className="hidden lg:block overflow-auto">
          <ul className="p-1 min-w-max lg:min-w-0">
            <EvolutionBranch startPokemonName={rootPokemonName} evolutionPaths={details.evolutionPaths} evolutionArtworks={details.evolutionArtworks} onSelect={handleEvolutionSelect} isPending={selectionStatus === "pending"} selectedPokemonName={details.name} selectedPaths={selectedPaths} />
          </ul>
        </div>
      </section>
    </>
  );
};

export default PokemonEvolutionPanel;
