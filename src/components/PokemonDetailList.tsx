import { useRef, useState } from "react";
import { type PokemonDetails } from "../api/getPokemonDetails";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";
import PokemonEvolutionPanel from "./PokemonEvolutionPanel";
import PokemonTypeEffectivenessPanel from "./PokemonTypeEffectivenessPanel";
import PokemonMovesPanel from "./PokemonMovesPanel";
import type { PokemonMoveItem } from "../api/getPokemonMoves";
import { motion } from "motion/react";

type Props = {
  details: PokemonDetails;
  moves: PokemonMoveItem[] | undefined;
  isMovesLoading: boolean;
  isMovesError: boolean;
};

type DetailTab = "stats" | "typeEffectiveness" | "moves";

const PokemonDetailList = ({ details, moves, isMovesLoading, isMovesError }: Props) => {
  // モバイルでのタブ切り替え
  const [activeTab, setActiveTab] = useState<DetailTab>("stats");
  const detailTabs: { id: DetailTab; label: string }[] = [
    { id: "stats", label: "種族値" },
    { id: "typeEffectiveness", label: "タイプ相性" },
    { id: "moves", label: "覚える技" },
  ];
  // 表示するポケモンが変わったら、モバイルのタブを種族値に戻す
  // - キャッシュがあるとそのコンポーネントは作り直されず、前回選択していたタブの状態が残ってしまうため
  // - key={pokemonName} で作り直すと進化表での選択時にモーダルが閉じられてしまう
  // - イベントハンドラではブラウザの 戻る/進む に対応ができない
  // - useEffectでは古いタブの状態が一瞬描画されてしまう
  // 以上の理由からdetails.nameを用いた描画中の状態変更を行う
  const [prevPokemonName, setPrevPokemonName] = useState(details.name);
  if (prevPokemonName !== details.name) {
    setPrevPokemonName(details.name);
    setActiveTab("stats");
  }

  // 合計種族値
  const totalStats = details.stats
    .map((stat) => stat.baseStat)
    .reduce((acc, cur) => {
      return acc + cur;
    }, 0);

  // パネルの共通レイアウト
  const panelClassName = "p-3 md:p-5 rounded-2xl border text-left shadow-lg border-(--border) bg-(--code-bg)";
  // 種族値ゲージの上限値
  const MAX_BASE_STAT = 255;

  // 進化表のモーダル
  const evolutionDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div
      className="grid grid-cols-1 gap-4 p-4
         md:grid-cols-2 lg:grid-cols-[1fr_0.8fr_1fr] "
    >
      {/* 基本情報 - 名前、画像、タイプ、特性、進化表モーダル */}
      <section className={panelClassName}>
        <div className="grid grid-cols-2 gap-4">
          {details.imageUrl !== null && <img className="mx-auto size-30 md:size-48 object-contain" src={details.imageUrl} alt={details.name} />}
          <div className="flex flex-col gap-2">
            <h2>{details.name}</h2>
            <ul className="flex gap-1 font-bold">
              {details.types.map((type) => {
                const typeInfo = pokemonTypeMap[type];
                return (
                  <li
                    key={type}
                    className={`${typeInfo.bgColorClass} rounded px-2 py-1 text-white text-sm md:text-base
                    `}
                  >
                    {typeInfo.ja}
                  </li>
                );
              })}
            </ul>
            {/* 進化表モーダル */}
            <button
              type="button"
              className="
              inline-flex items-center gap-2
              lg:hidden self-start mt-2 rounded-xl border border-(--border)
              bg-lime-600/80 dark:bg-white/10 px-3 py-2 shadow-sm
              transition hover:bg-lime-600 dark:hover:bg-white/25 active:scale-95
              font-semibold text-white
              bg-linear-to-br from-amber-500/80 dark:bg-linear-to-tr dark:from-white/40 dark:to-70%
              "
              onClick={() => evolutionDialogRef.current?.showModal()}
            >
              進化表を見る
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        {/* 特性 */}
        <section className={`${panelClassName} mt-2`}>
          <h2>特性</h2>
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {details.abilities.map((ability) => (
              <li key={ability.name} className="flex flex-col gap-1">
                <div className="flex flex-col gap-1 py-2 md:py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base md:text-lg text-slate-700 dark:text-slate-200">{ability.name}</span>

                    {ability.isHidden && <span className="rounded-full bg-pink-50 px-2 py-0.5 text-pink-600 text-xs">隠れ特性</span>}
                  </div>

                  <span className="text-sm md:text-base text-slate-600 leading-relaxed dark:text-slate-300">{ability.description?.replaceAll("　", "").replaceAll("\n", "") ?? "日本語の説明文がありません"}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </section>

      {/* タブ切り替えボタン */}
      <div
        className="md:hidden grid grid-cols-3 p-2 shadow-inner
            w-full max-w-md justify-self-center
            border rounded-full border-olive-50 dark:border-slate-400
            bg-black/5 dark:bg-white/10
            "
      >
        {detailTabs.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)} className="relative px-3 py-1">
            {activeTab === id && (
              <motion.span
                layoutId="detail-tab-button"
                className="absolute inset-0 rounded-2xl
                bg-linear-to-b from-olive-300 to-olive-100
                dark:from-amber-500 dark:to-amber-400
                "
              />
            )}
            <span className="relative z-10 sm:text-lg font-bold dark:text-white">{label}</span>
          </button>
        ))}
      </div>

      {/* 種族値 */}
      {/* 技タブが選択された時は hidden にする (空文字だとgap-4が残って技タブ選択時のみ不自然な間が空くため) */}
      <div className={`flex flex-col gap-4 ${activeTab === "moves" ? "hidden md:flex" : ""}`}>
        <section className={`${activeTab === "stats" ? "" : "hidden md:block"} ${panelClassName}`}>
          <div className="flex justify-between items-center">
            <h2 className="hidden md:block">種族値</h2>
            <span className="ml-auto">
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

        {/* タイプ相性 */}
        <PokemonTypeEffectivenessPanel typeEffectiveness={details.typeEffectiveness} panelClassName={`${activeTab === "typeEffectiveness" ? "" : "hidden md:block"} ${panelClassName}`} />
      </div>

      {/* 覚える技 */}
      <div className={`${activeTab === "moves" ? "" : "hidden md:block"} md:col-span-2 lg:col-span-1 lg:row-span-2 lg:relative`}>
        {isMovesLoading && <p>技データを読み込み中...</p>}
        {isMovesError && <p className="text-red-200">技の取得に失敗しました</p>}
        {moves && <PokemonMovesPanel pokemonMoves={moves} panelClassName={`${panelClassName} lg:absolute lg:inset-0 lg:flex lg:flex-col`} />}
      </div>

      {/* 進化チェーン */}
      <PokemonEvolutionPanel details={details} panelClassName={`${panelClassName} lg:col-span-2`} mobileDialogRef={evolutionDialogRef} />
    </div>
  );
};

export default PokemonDetailList;
