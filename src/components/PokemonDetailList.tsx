import { useRef, useState } from "react";
import { type PokemonDetails } from "../api/getPokemonDetails";
import { pokemonTypeMap } from "../lib/pokemonTypeMap";
import PokemonEvolutionPanel from "./PokemonEvolutionPanel";
import PokemonTypeEffectivenessPanel from "./PokemonTypeEffectivenessPanel";
import PokemonMovesPanel from "./PokemonMovesPanel";
import type { PokemonMoveItem } from "../api/getPokemonMoves";
import { motion } from "motion/react";
import { pokemonJaNameMap } from "../lib/pokemonSearchMap";
import LoadingSpinner from "./LoadingSpinner";

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

  const tabBackgroundRef = useRef<HTMLSpanElement>(null);
  // タブの移動範囲
  const tabBarRef = useRef<HTMLDivElement>(null);
  // ドラッグが起きたかどうか
  // ドラッグが終わった直後に発火しうるclickイベントを無視するためのref
  const isDraggedRef = useRef(false);

  // 合計種族値
  const totalStats = details.stats
    .map((stat) => stat.baseStat)
    .reduce((acc, cur) => {
      return acc + cur;
    }, 0);
  // 種族値の日本語化
  const jaNameStats: Record<string, string> = {
    hp: "HP",
    attack: "攻撃",
    defense: "防御",
    "special-attack": "特攻",
    "special-defense": "特防",
    speed: "素早さ",
  };

  // パネルの共通レイアウト
  const panelClassName = "p-3 md:p-5 rounded-2xl border text-left shadow-lg border-(--border) bg-(--code-bg)";
  // 種族値ゲージの上限値
  const MAX_BASE_STAT = 255;

  // 進化表のモーダル
  const evolutionDialogRef = useRef<HTMLDialogElement>(null);

  const hasEvolution = details.evolutionPaths.length !== 0;

  return (
    <div
      className="grid grid-cols-1 gap-4 p-4
         md:grid-cols-2 lg:grid-cols-[1fr_0.8fr_1fr] "
    >
      {/* 基本情報 - 名前、画像、タイプ、特性、進化表モーダル */}
      {/* 進化表のみをスクロールアンカーの候補にすることで、特性欄の行数変化によるカーソルのずれをなくす */}
      <section className={`[overflow-anchor:none] ${panelClassName} animate-detail-panel-fade-in`}>
        <div className="grid grid-cols-2 md:grid-cols-[2fr_3fr] lg:grid-cols-2 gap-4">
          {details.imageUrl !== null && <img className="mx-auto size-30 md:size-48 object-contain" src={details.imageUrl} alt={details.name} />}
          <div className="flex flex-col gap-2">
            <h2>{pokemonJaNameMap[details.name] ?? details.name}</h2>
            <ul className="flex gap-1 font-bold lg:flex-col lg:items-start">
              {details.types.map((type) => {
                const typeInfo = pokemonTypeMap[type];
                return (
                  <li
                    key={type}
                    className={`${typeInfo.bgColorClass} rounded px-2 py-1 text-white text-sm md:text-base whitespace-nowrap
                    `}
                  >
                    {typeInfo.ja}
                  </li>
                );
              })}
            </ul>
            {/* 進化表モーダル */}
            {hasEvolution ? (
              <button
                type="button"
                className="
              inline-flex items-center gap-2
              lg:hidden self-start rounded-xl border border-(--border)
              px-3 py-2 shadow-sm text-white dark:text-white font-semibold
              bg-olive-400 hover:bg-olive-500
              dark:bg-slate-800 dark:hover:bg-white/15
              transition active:scale-95
              "
                onClick={() => evolutionDialogRef.current?.showModal()}
              >
                進化表を見る
                <span aria-hidden="true">›</span>
              </button>
            ) : (
              <p className="lg:hidden self-start rounded-xl px-3 py-2 font-semibold border border-slate-300 border-dashed text-slate-400 bg-olive-200 dark:bg-slate-600 cursor-default select-none">進化 : なし</p>
            )}
          </div>
        </div>

        {/* 特性 */}
        <section className={`${panelClassName} mt-2`}>
          <h2>特性</h2>
          {details.abilities.length === 0 ? (
            <p className="text-olive-500 dark:text-slate-300">データが追加されていません</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {details.abilities.map((ability) => (
                <li key={ability.name} className="flex flex-col gap-1">
                  <div className="flex flex-col gap-1 py-2 md:py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base md:text-lg text-slate-700 dark:text-slate-200">{ability.name}</span>

                      {ability.isHidden && <span className="rounded-full bg-pink-50 px-2 py-0.5 text-pink-600 text-xs">隠れ特性</span>}
                    </div>

                    <span className="text-sm md:text-base text-slate-600 leading-relaxed dark:text-slate-300">{ability.description?.replaceAll("　", "").replaceAll("\n", "") ?? "未登録"}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      {/* タブ切り替えボタン */}
      <div
        ref={tabBarRef}
        className="md:hidden grid grid-cols-3 p-2 shadow-inner
            w-full max-w-md justify-self-center
            border rounded-full border-olive-300 dark:border-white/10
            bg-black/5 dark:bg-black/30
            select-none
            "
      >
        {detailTabs.map(({ id, label }, index) => (
          <button
            key={id}
            type="button"
            // 押下時にドラッグ中のフラグをリセット
            onPointerDown={() => (isDraggedRef.current = false)}
            onClick={() => {
              if (isDraggedRef.current) {
                isDraggedRef.current = false;
                return;
              }
              setActiveTab(id);
            }}
            className="relative px-3 py-1"
          >
            {activeTab === id && (
              <motion.span
                ref={tabBackgroundRef}
                drag="x"
                onDragStart={() => (isDraggedRef.current = true)}
                dragConstraints={tabBarRef}
                // 0ではバネの戻りの強さの内部設定が原因で挙動が崩れるため極力小さい値に設定
                dragElastic={0.0001}
                dragSnapToOrigin
                onDragEnd={(_event, info) => {
                  if (!tabBackgroundRef.current) return;
                  const tabWidth = tabBackgroundRef.current?.offsetWidth;
                  // 0なら元のタブ、-1or1なら一個先、-2or2なら二個先
                  let moveCount = Math.round(info.offset.x / tabWidth);
                  // タブの移動距離には満たないが速度が十分な場合に遷移
                  if (moveCount === 0 && Math.abs(info.velocity.x) >= 100) moveCount = Math.sign(info.velocity.x);
                  let nextIndex = index + moveCount;
                  // 範囲外にカーソルをドラッグした場合、最寄りの端にあるタブを選択
                  if (nextIndex > detailTabs.length - 1) nextIndex = detailTabs.length - 1;
                  if (nextIndex < 0) nextIndex = 0;
                  const nextTab = detailTabs[nextIndex];
                  if (!nextTab) return;

                  setActiveTab(nextTab?.id);
                }}
                layoutId="detail-tab-button"
                className="absolute inset-0 rounded-2xl
                bg-linear-to-b from-olive-300 to-olive-100
                dark:from-slate-700 dark:to-slate-600
                "
              />
            )}
            <span
              className={`relative z-10 pointer-events-none sm:text-lg font-bold
                  ${activeTab === id ? "text-(--accent)" : "dark:text-white"}
                  `}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* 種族値、 タイプ相性 */}
      {/* 技タブが選択された時は hidden にする (空文字だとgap-4が残って技タブ選択時のみ不自然な間が空くため) */}
      <div className={`[overflow-anchor:none] flex flex-col gap-4 ${activeTab === "moves" ? "hidden md:flex" : ""}`}>
        {/* 種族値 */}
        <section className={`${activeTab === "stats" ? "" : "hidden md:block"} ${panelClassName} animate-detail-panel-fade-in md:[animation-delay:80ms] `}>
          <div className="flex justify-between items-center">
            <h2 className="hidden md:block">種族値</h2>
            <span className="flex gap-2 ml-auto">
              <span>合計</span>
              <span className="text-olive-600 dark:text-white font-bold">{totalStats}</span>
            </span>
          </div>
          <ul>
            {details.stats.map((stat) => {
              const percentage = (stat.baseStat / MAX_BASE_STAT) * 100;
              return (
                <li key={stat.name} className="flex justify-between items-center">
                  <span className="w-14 shrink-0">{jaNameStats[stat.name]}</span>
                  <span className="w-12 mr-4 shrink-0 md:text-lg text-olive-600 dark:text-white text-right font-semibold tabular-nums">{stat.baseStat}</span>
                  {/* ゲージ */}
                  <div className="h-2 flex-1 rounded-full bg-olive-350 dark:bg-slate-200">
                    <div className="h-full rounded-full bg-(--accent)" style={{ width: `${percentage}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* タイプ相性 */}
        <PokemonTypeEffectivenessPanel typeEffectiveness={details.typeEffectiveness} panelClassName={`${activeTab === "typeEffectiveness" ? "" : "hidden md:block"} ${panelClassName} animate-detail-panel-fade-in md:[animation-delay:160ms]`} />
      </div>

      {/* 覚える技 */}
      <div className={`[overflow-anchor:none] ${activeTab === "moves" ? "" : "hidden md:block"} md:col-span-2 lg:col-span-1 lg:row-span-2 lg:relative`}>
        {isMovesLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-detail-panel-fade-in [animation-delay:300ms]">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {isMovesError && <p className="text-red-200">技の取得に失敗しました</p>}
        {moves && <PokemonMovesPanel pokemonMoves={moves} panelClassName={`${panelClassName} lg:absolute lg:inset-0 lg:flex lg:flex-col animate-detail-panel-fade-in md:[animation-delay:320ms]`} />}
      </div>

      {/* 進化チェーン */}
      <PokemonEvolutionPanel details={details} panelClassName={`${panelClassName} lg:col-span-2 lg:animate-detail-panel-fade-in lg:[animation-delay:240ms]`} mobileDialogRef={evolutionDialogRef} />
    </div>
  );
};

export default PokemonDetailList;
