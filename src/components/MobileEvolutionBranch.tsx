import type { EvolutionArtwork, EvolutionPath } from "../api/getPokemonDetails";
import { SELECTED_POKEMON_BAR_CLASS_NAME, SELECTED_POKEMON_FRAME_CLASS_NAME, SELECTED_POKEMON_TEXT_CLASS_NAME } from "../lib/evolutionClassNames";
import { formatEvolutionConditions } from "../lib/formatEvolutionConditions";

type MobileEvolutionBranchProps = {
  startPokemonName: string;
  evolutionPaths: EvolutionPath[];
  evolutionArtworks: EvolutionArtwork[];
  onSelect: (pokemonName: string) => Promise<void>;
  isPending: boolean;
  selectedPokemonName: string;
  selectedPaths: EvolutionPath[];
  // 線の着色に使う再帰用props
  connectorState?: "connector-through" | "connector-target";
};

// 再帰コンポーネントで進化チェーンを返す(モバイル版)
const MobileEvolutionBranch = ({ startPokemonName, evolutionPaths, evolutionArtworks, onSelect, isPending, selectedPokemonName, selectedPaths, connectorState }: MobileEvolutionBranchProps) => {
  const branchPaths = evolutionPaths.filter((path) => path.from.name === startPokemonName);

  const sprite = evolutionArtworks.find((artwork) => artwork.name === startPokemonName)?.sprite ?? null;

  const currentConditions = evolutionPaths.find((path) => path.to.name === startPokemonName)?.evoDetails ?? null;

  const isSelected = startPokemonName === selectedPokemonName;

  const hasSelectedPath = branchPaths.some((path) => selectedPaths.some((selectedPath) => selectedPath === path));

  // 選択中ポケモンまでの線着色用のインデックス
  const targetBranchIndex = branchPaths.findIndex((path) => {
    return selectedPaths.some((selectedPath) => selectedPath === path);
  });

  return (
    <li className={`flex flex-col items-start ${connectorState ?? ""}`}>
      <div>
        {/* 名前・スプライト */}
        <button
          type="button"
          onClick={() => onSelect(startPokemonName)}
          disabled={isPending}
          className={`mt-1 mb-1 p-1
        ${isSelected ? `${SELECTED_POKEMON_FRAME_CLASS_NAME} ${SELECTED_POKEMON_TEXT_CLASS_NAME}` : ""}`}
        >
          <span>{startPokemonName}</span>
          {sprite !== null && <img className="size-18" src={sprite} alt={startPokemonName} />}
        </button>
        {/* 進化条件 */}
        {currentConditions !== null && (
          <div className={`flex flex-col ${isSelected ? `${SELECTED_POKEMON_TEXT_CLASS_NAME}` : ""}`}>
            {formatEvolutionConditions(currentConditions).map((condition) => (
              <span key={condition.key}>
                {condition.label}: {condition.value}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* 分岐なし進化の縦線 */}
      {branchPaths.length === 1 && <span aria-hidden="true" className={`w-0.5 h-8 ml-9 block ${hasSelectedPath ? `${SELECTED_POKEMON_BAR_CLASS_NAME}` : "bg-slate-400"}`} />}

      {branchPaths.length > 0 && (
        // 分岐進化のレイアウト判定 + 再帰表示
        <ul className={branchPaths.length > 1 ? "mobile-evolution-branches ml-17" : ""}>
          {branchPaths.map((path, index) => (
            <MobileEvolutionBranch
              key={path.to.name}
              startPokemonName={path.to.name}
              evolutionPaths={evolutionPaths}
              evolutionArtworks={evolutionArtworks}
              onSelect={onSelect}
              isPending={isPending}
              selectedPokemonName={selectedPokemonName}
              selectedPaths={selectedPaths}
              // 通り道は縦線だけを着色 / 目的地は横線も着色 / targetIndexより先の要素には何もしない
              connectorState={index < targetBranchIndex ? "connector-through" : index === targetBranchIndex ? "connector-target" : undefined}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MobileEvolutionBranch;
