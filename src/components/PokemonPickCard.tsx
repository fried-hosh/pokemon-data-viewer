import { Link } from "react-router-dom";
import { usePokemonCard } from "../hooks/usePokemonCard";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";

type Props = {
  jaName: string;
  apiName: string;
};

const normalCircleClassName = "from-slate-400 to-slate-100";
const legendaryCircleClassName = "from-orange-500 via-amber-300 to-yellow-100 shadow-lg shadow-orange-500/30";
const mythicalCircleClassName = "from-pink-300 via-violet-300 to-cyan-200 shadow-lg shadow-pink-300/60";

const PokemonPickCard = ({ jaName, apiName }: Props) => {
  const { data, isError } = usePokemonCard(apiName);

  if (isError) {
    return <p className="text-red-200">取得失敗</p>;
  }

  let circleClassName = normalCircleClassName;
  if (data?.isLegendary) {
    circleClassName = legendaryCircleClassName;
  }
  if (data?.isMythical) {
    circleClassName = mythicalCircleClassName;
  }

  return (
    <div className={`relative h-full transform-3d transition-transform duration-1000 ${data !== undefined ? "rotate-y-180" : ""}`}>
      {/* カード裏面 */}
      <div
        className="
      absolute z-30 inset-0 h-full rounded-2xl border shadow-lg border-(--border) dark:border-0 bg-linear-to-br from-amber-400 to-slate-400
      backface-hidden
      "
      />
      {/* 表面 */}
      {data !== undefined && (
        <Link
          to={`/pokemon/${apiName}`}
          className={`
    flex md:flex-col gap-0.5 p-1 items-center h-full
    rounded-2xl border shadow-lg border-(--border) dark:border-0
    bg-linear-to-br from-sky-200 to-amber-50
    dark:from-slate-800 dark:to-amber-50
    backface-hidden rotate-y-180
    `}
        >
          {/* スプライト レアリティサークル */}
          <div className="relative">
            {data.image !== null && <img src={data.image} alt={jaName} className="relative z-10 size-30 md:size-35" />}
            <span
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-12 rounded-full bg-linear-to-tr ${circleClassName}
        `}
            />
          </div>
          {/* 図鑑番号 名前 分類 タイプ */}
          <div
            className="
      flex flex-col gap-0.5 flex-1
      dark:text-slate-800
      "
          >
            <p className="text-sm">全国図鑑No.{data.dexNumber}</p>
            <p className="flex items-center justify-center font-bold text-slate-900 dark:text-slate-900 md:min-h-[2lh]">{jaName}</p>
            <p>{data.genus}</p>
            <div className="flex justify-center gap-1">
              {data.types.map((type) => (
                <span key={type} className={`${pokemonTypeMap[type].bgColorClass} font-bold rounded px-2 py-1 text-white text-xs md:text-base whitespace-nowrap`}>
                  {pokemonTypeMap[type].ja}
                </span>
              ))}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default PokemonPickCard;
