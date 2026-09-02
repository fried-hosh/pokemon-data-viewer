import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { EvolutionArtwork, EvolutionPath } from "../api/getPokemonDetails";
import { SELECTED_POKEMON_BAR_CLASS_NAME, SELECTED_POKEMON_FRAME_CLASS_NAME, SELECTED_POKEMON_TEXT_CLASS_NAME } from "../lib/evolutionClassNames";
import { formatEvolutionConditions } from "../lib/formatEvolutionConditions";

type EvolutionBranchProps = {
  startPokemonName: string;
  evolutionPaths: EvolutionPath[];
  evolutionArtworks: EvolutionArtwork[];
  onSelect: (pokemonName: string) => Promise<void>;
  isPending: boolean;
  selectedPokemonName: string;
  // 選択中〜根本のポケモンまでが入ったpaths
  selectedPaths: EvolutionPath[];
};

// 再帰コンポーネントで進化チェーンを返す
const EvolutionBranch = ({ startPokemonName, evolutionPaths, evolutionArtworks, onSelect, isPending, selectedPokemonName, selectedPaths }: EvolutionBranchProps) => {
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

  const isCurrentPathSelected = selectedPaths.some((path) => path === currentPath);

  const hasSelectedPath = branchPaths.some((path) => selectedPaths.some((selectedPath) => selectedPath === path));

  // 横線クラス
  const currentPathBarClassName = `h-0.5 w-8  ${isCurrentPathSelected ? `relative z-10 ${SELECTED_POKEMON_BAR_CLASS_NAME}` : "bg-slate-400"}`;

  // 縦線の着色をするため、要素の中心までの高さを取る
  const targetBranchIndex = branchPaths.findIndex((path) => selectedPaths.some((selectedPath) => selectedPath === path));
  const branchListRef = useRef<HTMLUListElement>(null);
  const [selectedLinePosition, setSelectedLinePosition] = useState<{ height: number; top: number } | null>(null);
  const measureLine = useCallback(() => {
    // liの中心
    const targetLi = branchListRef.current?.children[targetBranchIndex];
    if (!targetLi) {
      setSelectedLinePosition(null);
      return;
    }
    const rect = targetLi.getBoundingClientRect();
    const liCenterY = rect.top + rect.height / 2;

    // ulの中心
    const targetUl = branchListRef.current;
    const ulRect = targetUl?.getBoundingClientRect();
    if (!ulRect) {
      setSelectedLinePosition(null);
      return;
    }
    const ulCenterY = ulRect.top + ulRect.height / 2;

    // 着色範囲
    const lineHeight = Math.abs(liCenterY - ulCenterY);
    // 着色のul内基準点
    const lineTop = Math.min(liCenterY, ulCenterY) - ulRect.top;

    setSelectedLinePosition({
      height: lineHeight,
      top: lineTop,
    });
  }, [targetBranchIndex]);

  // useLayoutEffect : 画面描画前に実行 / レイアウトを作ってから表示可能
  useLayoutEffect(() => {
    // ulのサイズ変更を監視
    const targetUl = branchListRef.current;
    if (!targetUl) return;

    const observer = new ResizeObserver(() => {
      measureLine();
    });
    observer.observe(targetUl);
    return () => {
      observer.disconnect();
    };
  }, [measureLine]);

  return (
    <li
      className="relative flex items-center
      after:absolute after:top-0 after:bottom-0 after:left-0 after:w-0.5 after:bg-slate-400
      first:after:top-1/2
      last:after:bottom-1/2
      only:after:hidden"
    >
      {/* 進化条件 */}
      {conditions !== null && <span aria-hidden="true" className={currentPathBarClassName} />}
      <div className={`${isSelected ? SELECTED_POKEMON_TEXT_CLASS_NAME : ""}`}>
        {conditions !== null &&
          formattedConditions.map((condition) => (
            <p key={condition.key}>
              {condition.label}: {condition.value}
            </p>
          ))}
      </div>
      {conditions !== null && <span aria-hidden="true" className={currentPathBarClassName} />}

      {/* 名前・スプライト */}
      <button type="button" onClick={() => onSelect(startPokemonName)} disabled={isPending} className={isSelected ? `${SELECTED_POKEMON_FRAME_CLASS_NAME} ${SELECTED_POKEMON_TEXT_CLASS_NAME}` : ""}>
        {sprite !== null && <img className="h-24 w-24 object-contain" src={sprite} alt={startPokemonName} />}
        <span>{startPokemonName}</span>
      </button>

      {branchPaths.length > 0 && (
        <>
          <span aria-hidden="true" className={`h-0.5 w-8 ${hasSelectedPath ? SELECTED_POKEMON_BAR_CLASS_NAME : "bg-slate-400"}`} />

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
            <div className="relative">
              {/* 分岐の縦線 */}
              {selectedLinePosition !== null && <span className={`absolute left-0 w-0.5 z-10 aria-hidden ${SELECTED_POKEMON_BAR_CLASS_NAME}`} style={{ height: selectedLinePosition.height, top: selectedLinePosition.top }} />}
              {/* 再帰呼び出し */}
              <ul ref={branchListRef}>
                {branchPaths.map((path) => (
                  <EvolutionBranch key={path.to.name} startPokemonName={path.to.name} evolutionPaths={evolutionPaths} evolutionArtworks={evolutionArtworks} onSelect={onSelect} isPending={isPending} selectedPokemonName={selectedPokemonName} selectedPaths={selectedPaths} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </li>
  );
};

export default EvolutionBranch;
