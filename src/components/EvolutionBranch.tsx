import type { EvolutionArtwork, EvolutionPath } from "../api/getPokemonDetails";

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

  return (
    <li className="flex">
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
