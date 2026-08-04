import { type PokemonDetails } from "../api/getPokemonDetails";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";

type Props = {
  details: PokemonDetails;
};

const PokemonDetailList = ({ details }: Props) => {
  const totalStats = details.stats
    .map((stat) => stat.baseStat)
    .reduce((acc, cur) => {
      return acc + cur;
    }, 0);

  // パネルの共通レイアウト
  const panelClassName = "p-5 rounded-2xl border text-left shadow-lg border-[var(--border)] bg-[var(--code-bg)]";

  const MAX_BASE_STAT = 255;

  return (
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 ">
      {/* 基本情報 - 名前、画像、タイプ */}
      <section className={panelClassName}>
        <div className="grid grid-cols-2 items-center gap-4">
          {details.imageUrl !== null && <img className="mx-auto w-full max-w-3xs" src={details.imageUrl} alt={details.name} />}
          <div>
            <h2>{details.name}</h2>
            <ul className="flex gap-1 font-bold">
              {details.types.map((type) => {
                const typeInfo = pokemonTypeMap[type];
                return (
                  <li key={type} className={`${typeInfo.bgColorClass} rounded px-2 py-1 text-white`}>
                    {typeInfo.ja}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* 進化チェーン */}
      <section className={panelClassName}>
        <h2>進化表</h2>
        <ul>
          {details.evolutions.map((evo) => (
            <li key={evo.name}>{evo.name}</li>
            // 各画像
          ))}
        </ul>
      </section>

      {/* 特性 */}
      <section className={panelClassName}>
        <h2>特性</h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {details.abilities.map((ability) => (
            <li key={ability.name} className="flex flex-col gap-1">
              <div className="flex flex-col gap-1 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{ability.name}</span>

                  {ability.isHidden && <span className="rounded-full bg-pink-50 px-2 py-0.5 text-pink-600 text-xs">隠れ特性</span>}
                </div>

                <span className="text-sm text-slate-600 leading-relaxed dark:text-slate-300">{ability.description?.replaceAll("　", "").replaceAll("\n", "") ?? "日本語の説明文がありません"}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* タイプ相性 */}
      <section className={panelClassName}>
        <h2>タイプ相性</h2>
      </section>

      {/* 種族値 */}
      <section className={panelClassName}>
        <div className="flex justify-between items-center">
          <h2>種族値</h2>
          <span>
            合計
            <strong> {totalStats}</strong>
          </span>
        </div>
        <ul>
          {details.stats.map((stat) => {
            const percentage = (stat.baseStat / MAX_BASE_STAT) * 100;
            return (
              <li key={stat.name} className="flex justify-between items-center">
                <span className="w-36 shrink-0">{stat.name}</span>
                {/* ゲージ */}
                <div className="h-2 flex-1 rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-orange-400" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right tabular-nums">{stat.baseStat}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 覚える技 */}
      <section className={panelClassName}>
        <h2>覚える技</h2>
      </section>
    </div>
  );
};

export default PokemonDetailList;
