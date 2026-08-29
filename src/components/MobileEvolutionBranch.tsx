import type { EvolutionArtwork, EvolutionPath } from "../api/getPokemonDetails";
import { SELECTED_POKEMON_FRAME_CLASS_NAME, SELECTED_POKEMON_TEXT_CLASS_NAME } from "../lib/evolutionClassNames";
import { formatEvolutionConditions } from "../lib/formatEvolutionConditions";

type MobileEvolutionBranchProps = {
  startPokemonName: string;
  evolutionPaths: EvolutionPath[];
  evolutionArtworks: EvolutionArtwork[];
  onSelect: (pokemonName: string) => Promise<void>;
  isPending: boolean;
  selectedPokemonName: string;
};

// 再帰コンポーネントで進化チェーンを返す(モバイル版)
const MobileEvolutionBranch = ({ startPokemonName, evolutionPaths, evolutionArtworks, onSelect, isPending, selectedPokemonName }: MobileEvolutionBranchProps) => {
  const branchPaths = evolutionPaths.filter((path) => path.from.name === startPokemonName);

  const sprite = evolutionArtworks.find((artwork) => artwork.name === startPokemonName)?.sprite ?? null;

  const currentConditions = evolutionPaths.find((path) => path.to.name === startPokemonName)?.evoDetails ?? null;

  const isSelected = startPokemonName === selectedPokemonName;

  return (
    <li className="flex flex-col items-start">
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
      {/* 分岐なし進化の縦線 画像sizeが18のため 9ずらす */}
      {branchPaths.length === 1 && <span aria-hidden="true" className="w-px h-8 bg-slate-500 ml-9 block" />}

      {branchPaths.length > 0 && (
        // 分岐進化のレイアウト判定 + 再帰表示
        <ul className={branchPaths.length > 1 ? "mobile-evolution-branches ml-17" : undefined}>
          {branchPaths.map((path) => (
            <MobileEvolutionBranch key={path.to.name} startPokemonName={path.to.name} evolutionPaths={evolutionPaths} evolutionArtworks={evolutionArtworks} onSelect={onSelect} isPending={isPending} selectedPokemonName={selectedPokemonName} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MobileEvolutionBranch;
