import type { TypeEffectivenessGroup } from "../api/getTypeEffectiveness";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";

type Props = {
  typeEffectiveness: TypeEffectivenessGroup[] | null;
  panelClassName: string;
};

const PokemonTypeEffectivenessPanel = ({ typeEffectiveness, panelClassName }: Props) => {
  const multiplierBorderColorMap: Record<TypeEffectivenessGroup["multiplier"], string> = {
    4: "border-red-400",
    2: "border-orange-400",
    0.5: "border-sky-400",
    0.25: "border-indigo-400",
    0: "border-zinc-500",
  };

  return (
    <section className={`${panelClassName} flex-1`}>
      <h2>タイプ相性</h2>
      {typeEffectiveness !== null &&
        typeEffectiveness.map(({ multiplier, types }) => (
          <div key={multiplier} className="flex gap-3 py-2">
            {/* 倍率 */}
            <span className={`flex w-12 border-l-5 pl-2 items-center ${multiplierBorderColorMap[multiplier]}`}>{multiplier === 0 ? "無効" : `x${multiplier}`}</span>
            {/* タイプ名 */}
            <span className="flex flex-1 flex-wrap gap-2 font-bold">
              {types.map((type) => {
                const typeInfo = pokemonTypeMap[type];
                return (
                  <span key={type} className={`rounded px-2 py-1 text-white ${typeInfo.bgColorClass}`}>
                    {typeInfo.ja}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
    </section>
  );
};

export default PokemonTypeEffectivenessPanel;
