import { Link } from "react-router-dom";
import { usePokemonCard } from "../hooks/usePokemonCard";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";

type Props = {
  jaName: string;
  apiName: string;
};

const PokemonPickCard = ({ jaName, apiName }: Props) => {
  // const legendaryCardClassName = "from-fuchsia-600 to-fuchsia-100";
  // const mythicalCardClassName = "from-yellow-500 to-yellow-100";
  const { data, isPending, isError } = usePokemonCard(apiName);
  if (isPending) {
    return <p className="">読み込み中...</p>;
  }
  if (isError) {
    return <p className="text-red-200">取得失敗</p>;
  }

  return (
    <Link
      to={`/pokemon/${apiName}`}
      className={`
    flex md:flex-col gap-0.5 p-1 items-center h-full
    rounded-2xl border shadow-lg border-(--border) dark:border-0
    bg-linear-to-br from-sky-200 to-amber-50
    dark:from-slate-800 dark:to-amber-50
    `}
    >
      <div className="relative">
        {data.image !== null && <img src={data.image} alt={jaName} className="relative z-10 size-30 md:size-35" />}
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-12 shadow-inner rounded-full bg-linear-to-tr from-slate-400/30 to-slate-100
        "
        />
      </div>
      {/* 図鑑番号 名前 分類 タイプ */}
      <div
        className="
      flex flex-col gap-0.5 flex-1 justify-center
      dark:text-slate-800
      "
      >
        <p className="text-sm">全国図鑑No.{data.dexNumber}</p>
        <p className="font-bold text-slate-900 dark:text-slate-900">{jaName}</p>
        <p>{data.genus}</p>
        <div className="flex justify-center gap-1">
          {data.types.map((type) => (
            <span key={type} className={`${pokemonTypeMap[type].bgColorClass} rounded px-2 py-1 text-white text-xs md:text-base whitespace-nowrap`}>
              {pokemonTypeMap[type].ja}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default PokemonPickCard;
