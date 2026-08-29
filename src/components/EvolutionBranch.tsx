import type { EvolutionArtwork, EvolutionPath } from "../api/getPokemonDetails";
import { SELECTED_POKEMON_FRAME_CLASS_NAME, SELECTED_POKEMON_TEXT_CLASS_NAME } from "../lib/evolutionClassNames";
import { formatEvolutionConditions } from "../lib/formatEvolutionConditions";

type EvolutionBranchProps = {
  startPokemonName: string;
  evolutionPaths: EvolutionPath[];
  evolutionArtworks: EvolutionArtwork[];
  onSelect: (pokemonName: string) => Promise<void>;
  isPending: boolean;
  selectedPokemonName: string;
};

// 再帰コンポーネントで進化チェーンを返す
const EvolutionBranch = ({ startPokemonName, evolutionPaths, evolutionArtworks, onSelect, isPending, selectedPokemonName }: EvolutionBranchProps) => {
  const branchPaths: EvolutionPath[] = [];

  for (const path of evolutionPaths) {
    if (path.from.name === startPokemonName) {
      branchPaths.push(path);
    }
  }

  // イーブイ用レイアウトに使う判定
  const directEvolutionNames = branchPaths.map((path) => path.to.name);
  // 進化先にさらに進化形態があるか
  const hasNextEvolution = directEvolutionNames.some((name) => evolutionPaths.some((path) => path.from.name === name));
  const useManyBranchGrid = branchPaths.length >= 4 && !hasNextEvolution;
  // イーブイに使う用のartworkを取り出す
  const getSprite = (toName: string): string | null => {
    return evolutionArtworks.find((art) => art.name === toName)?.sprite ?? null;
  };

  // 通常の再帰表示用artwork
  const sprite = evolutionArtworks.find((artwork) => artwork.name === startPokemonName)?.sprite ?? null;

  // 進化条件を拾うためのパス
  const currentPath = evolutionPaths.find((path) => path.to.name === startPokemonName);
  const conditions = currentPath?.evoDetails ?? null;

  const formattedConditions = formatEvolutionConditions(conditions);

  const isSelected = startPokemonName === selectedPokemonName;

  return (
    <li
      className="relative flex items-center
      after:absolute after:top-0 after:bottom-0 after:left-0 after:w-px after:bg-slate-500
      first:after:top-1/2
      last:after:bottom-1/2
      only:after:hidden"
    >
      {conditions !== null && <span aria-hidden="true" className="h-px w-8 bg-slate-500" />}
      {/* 進化条件 */}
      <div className={`${isSelected ? `${SELECTED_POKEMON_TEXT_CLASS_NAME}` : ""}`}>
        {conditions !== null &&
          formattedConditions.map((condition) => (
            <p key={condition.key}>
              {condition.label}: {condition.value}
            </p>
          ))}
      </div>
      {conditions !== null && <span aria-hidden="true" className="h-px w-8 bg-slate-500" />}

      {/* 名前・スプライト */}
      <button type="button" onClick={() => onSelect(startPokemonName)} disabled={isPending} className={isSelected ? `${SELECTED_POKEMON_FRAME_CLASS_NAME} ${SELECTED_POKEMON_TEXT_CLASS_NAME}` : ""}>
        {sprite !== null && <img className="h-24 w-24 object-contain" src={sprite} alt={startPokemonName} />}
        <span>{startPokemonName}</span>
      </button>
      {branchPaths.length > 0 && (
        <>
          <span aria-hidden="true" className="h-px w-8 bg-slate-500" />

          {/* 4分岐以上かつ1進化（イーブイ）でのみ特殊レイアウト */}
          {useManyBranchGrid ? (
            <ul className="grid grid-cols-3 border rounded-xl gap-2 p-2">
              {branchPaths.map((path) => {
                const sprite = getSprite(path.to.name);
                const isBranchSelected = selectedPokemonName === path.to.name;
                return (
                  <li key={path.to.name} className={`flex flex-col items-center p-2 gap-1 ml-2 mr-2 ${isBranchSelected ? `${SELECTED_POKEMON_FRAME_CLASS_NAME} ${SELECTED_POKEMON_TEXT_CLASS_NAME}` : ""}`}>
                    <button type="button" onClick={() => onSelect(path.to.name)} disabled={isPending}>
                      {sprite !== null && <img className="h-24 w-24 object-contain" src={sprite} alt={path.to.name} />}
                      <span>{path.to.name}</span>
                    </button>
                    {formatEvolutionConditions(path.evoDetails).map((condition) => (
                      <p key={condition.key}>
                        {condition.label}: {condition.value}
                      </p>
                    ))}
                  </li>
                );
              })}
            </ul>
          ) : (
            // 通常レイアウト
            <ul>
              {branchPaths.map((path) => (
                <EvolutionBranch key={path.to.name} startPokemonName={path.to.name} evolutionPaths={evolutionPaths} evolutionArtworks={evolutionArtworks} onSelect={onSelect} isPending={isPending} selectedPokemonName={selectedPokemonName} />
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
};

export default EvolutionBranch;
