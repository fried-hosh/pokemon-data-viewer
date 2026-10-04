import { Link } from "react-router-dom";
import { usePokemonCard } from "../hooks/usePokemonCard";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";
import { useState } from "react";

type Props = {
  jaName: string;
  apiName: string;
  index: number;
};

const normalCircleClassName = "from-slate-400 to-slate-100";
const legendaryCircleClassName = "from-orange-500 via-amber-300 to-yellow-100 shadow-lg shadow-orange-500/30";
const mythicalCircleClassName = "from-pink-300 via-violet-300 to-cyan-200 shadow-lg shadow-pink-300/60";

const PokemonPickCard = ({ jaName, apiName, index }: Props) => {
  const { data, isError } = usePokemonCard(apiName);
  // 画像の取得が成功・失敗に関わらず完了したかどうか
  const [isImgSettled, setIsImgSettled] = useState(false);
  // カードが配られ終えたかどうか
  const [isDealt, setIsDealt] = useState(false);
  // カードが光り終えたかどうか
  const [isGlowEnd, setIsGlowEnd] = useState(false);

  // 画像を読み込み終えたか、画像がないときに表面を見せる
  const isFrontReady = isImgSettled || data?.image === null;

  if (isError) {
    return <p className="absolute inset-0 z-10 flex justify-center items-center rounded-2xl bg-slate-800/90 text-red-200">取得失敗</p>;
  }

  const isRare = data?.isLegendary || data?.isMythical;

  let circleClassName = normalCircleClassName;
  if (data?.isLegendary) {
    circleClassName = legendaryCircleClassName;
  }
  if (data?.isMythical) {
    circleClassName = mythicalCircleClassName;
  }

  let glowClassName = "";
  if (data?.isLegendary) {
    glowClassName = "animate-legendary-glow";
  }
  if (data?.isMythical) {
    glowClassName = "animate-mythical-glow";
  }

  return (
    // フェードイン
    <div className="absolute inset-0 z-10 animate-card-fade-in-mobile md:animate-card-fade-in perspective-distant" style={{ animationDelay: `${index * 80}ms` }} onAnimationEnd={() => setIsDealt(true)}>
      {/* 回転 */}
      <div className={`relative h-full transform-3d transition-transform duration-1000 ${isFrontReady && isDealt && (isGlowEnd || !isRare) ? "rotate-x-180 md:rotate-x-0 md:rotate-y-180" : ""}`}>
        {/* カード裏面 */}
        <div
          className={`
      absolute inset-0 rounded-2xl border shadow-lg border-(--border) dark:border-0 bg-linear-to-br from-slate-700 to-slate-900
      backface-hidden ${isDealt && isRare ? glowClassName : ""}
      `}
          onAnimationEnd={() => setIsGlowEnd(true)}
        >
          {/* ボールマーク */}
          <div
            className="
        absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 size-16 rounded-full border-4 border-white/80 bg-origin-border
        bg-linear-to-b from-pink-400 from-50% to-slate-50 to-50%
        "
          >
            {/* ボール真ん中の区切り線 */}
            <div className="absolute top-1/2 inset-x-0 h-1 -translate-y-1/2 bg-slate-900" />
            {/* ボール真ん中の丸ボタン */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 rounded-full border-4 border-slate-900 bg-slate-50" />
          </div>
        </div>

        {/* 表面 */}
        {data !== undefined && (
          <Link
            to={`/pokemon/${apiName}`}
            className={`
    flex md:flex-col gap-0.5 p-1 items-center h-full
    rounded-2xl border shadow-lg border-(--border) dark:border-0
    bg-linear-to-br from-sky-200 to-amber-50
    dark:from-slate-800 dark:to-amber-50
    backface-hidden rotate-x-180 md:rotate-x-0 md:rotate-y-180
    `}
          >
            {/* スプライト レアリティサークル */}
            <div className="relative">
              {/* 画像が読み込まれてからカードを回転させることで、キャッシュ時の即時表示を防ぐ */}
              {data.image !== null && <img src={data.image} alt={jaName} onLoad={() => setIsImgSettled(true)} onError={() => setIsImgSettled(true)} className="relative z-10 size-30 md:size-35" />}
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
    </div>
  );
};

export default PokemonPickCard;
