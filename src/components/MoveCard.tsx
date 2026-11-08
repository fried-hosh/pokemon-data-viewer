import { useState } from "react";
import type { PokemonMoveItem } from "../api/getPokemonMoves";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";

type Props = {
  move: PokemonMoveItem;
};
const damageClassMap: Record<PokemonMoveItem["damageClass"], string> = {
  physical: "物理",
  special: "特殊",
  status: "変化",
};

// 技一件分
const MoveCard = ({ move }: Props) => {
  const [toggleFlavorText, setToggleFlavorText] = useState(false);
  return (
    <div
      onClick={() => setToggleFlavorText(!toggleFlavorText)}
      className="
    p-2 mb-2 shadow-sm border
    border-olive-400/70 bg-amber-100/40
    dark:border-amber-50/80 dark:bg-amber-100/4 rounded
    hover:ring hover:ring-pink-400 hover:dark:ring-amber-500
    select-none
    "
    >
      {/* mdのみ配置変更 */}
      <div className="md:grid md:grid-cols-2 md:items-center md:gap-6 lg:block">
        {/* 1段目 - レベル 技名 タイプ名 */}
        <div className="flex gap-3 items-center">
          {move.learnMethod === "level-up" && <span className="w-12">Lv. {move.level} </span>}
          <div className="flex flex-1 items-center justify-between ">
            <span className="text-olive-700 dark:text-white">{move.jaName}</span>
            <span className={`rounded-xl px-2 py-1 text-white text-sm ${pokemonTypeMap[move.type].bgColorClass}`}>{pokemonTypeMap[move.type].ja}</span>
          </div>
        </div>
        {/* 2段目 - 技区分 威力 命中 PP*/}
        <div className="flex justify-between">
          <span>{damageClassMap[move.damageClass]}</span>
          <div className="flex gap-4">
            <span className="flex justify-between w-16">
              <span>威力</span>
              <span>{move.power || "―"}</span>
            </span>
            <span className="flex justify-between w-16">
              <span>命中</span>
              <span>{move.accuracy || "―"}</span>
            </span>
            <span className="flex justify-between w-10">
              <span>PP</span>
              <span>{move.pp || "―"}</span>
            </span>
          </div>
        </div>
      </div>
      {/* 3段目 - フレーバーテキスト開閉 */}
      {/* 開閉線 */}
      {move.flavorText !== null && (
        <div className="flex items-center select-none">
          <div className="flex-1 border-t border-dashed" />
          <span className={`transition-transform duration-200 ${toggleFlavorText ? "rotate-180" : ""}`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
          <div className="flex-1 border-t border-dashed" />
        </div>
      )}
      {/* テキスト */}
      {/* gridの0fr〜1frで高さの変化を計算してアニメーションをつける */}
      {move.flavorText !== null && (
        <div className={`grid ${toggleFlavorText ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} transition-[grid-template-rows] duration-200`}>
          <span className="overflow-hidden">{move.flavorText}</span>
        </div>
      )}
    </div>
  );
};

export default MoveCard;
