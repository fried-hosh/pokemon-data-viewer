import type { EvolutionArtwork, EvolutionPath } from "../api/getPokemonDetails";
import { formatEvolutionConditions } from "../lib/formatEvolutionConditions";

type EvolutionBranchProps = {
  startPokemonName: string;
  evolutionPaths: EvolutionPath[];
  evolutionArtworks: EvolutionArtwork[];
  onSelect: (pokemonName: string) => Promise<void>;
  isPending: boolean;
};

// 再帰コンポーネントで進化チェーンを返す
const EvolutionBranch = ({ startPokemonName, evolutionPaths, evolutionArtworks, onSelect, isPending }: EvolutionBranchProps) => {
  const branchPaths: EvolutionPath[] = [];

  for (const path of evolutionPaths) {
    if (path.from.name === startPokemonName) {
      branchPaths.push(path);
    }
  }
  const sprite = evolutionArtworks.find((artwork) => artwork.name === startPokemonName)?.sprite ?? null;

  // 進化条件を拾うためのパス
  const currentPath = evolutionPaths.find((path) => path.to.name === startPokemonName);
  const conditions = currentPath?.evoDetails ?? null;

  const formattedConditions = formatEvolutionConditions(conditions);

  return (
    <li className="flex">
      {/* 進化条件 */}
      <div>
        {conditions !== null &&
          formattedConditions.map((condition) => (
            <p key={condition.key}>
              {condition.label}: {condition.value}
            </p>
          ))}
      </div>

      {/* 名前・スプライト */}
      <button type="button" onClick={() => onSelect(startPokemonName)} disabled={isPending}>
        <span>{startPokemonName}</span>
        {sprite !== null && <img className="h-24 w-24 object-contain" src={sprite} alt={startPokemonName} />}
      </button>
      {branchPaths.length > 0 && (
        <ul>
          {branchPaths.map((path) => (
            <EvolutionBranch key={path.to.name} startPokemonName={path.to.name} evolutionPaths={evolutionPaths} evolutionArtworks={evolutionArtworks} onSelect={onSelect} isPending={isPending} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default EvolutionBranch;
