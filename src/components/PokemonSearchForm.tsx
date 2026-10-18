import { useRef, useState } from "react";
import { pokemonSearchMap } from "../lib/pokemonSearchMap";
import { normalizeSearchText } from "../lib/normalizeSearchText";
import { flushSync } from "react-dom";

type Props = {
  onSearch: (name: string) => void;
};

const PokemonSearchForm = ({ onSearch }: Props) => {
  const [inputName, setInputName] = useState("");
  // 検索候補
  const [isSuggestOpen, setIsSuggestOpen] = useState<boolean>(true);

  // 変換確定前に候補を選択した場合のモバイルIME動作不具合解消
  const inputRef = useRef<HTMLInputElement>(null);
  const pointerTypeRef = useRef<string>("mouse");

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = inputName.trim();
    if (trimmedName === "") {
      return;
    }
    // りざーどん(ひらがな) ポリゴンZ(全角) 等の入力から送信できるようにする
    const normalizedName = normalizeSearchText(trimmedName);
    const matchedName = Object.keys(pokemonSearchMap).find((name) => normalizeSearchText(name) === normalizedName);

    // 検索失敗時
    if (!matchedName) {
      setIsSuggestOpen(true);
      // フォーカスをinputに戻してonBlurが効くようにする
      inputRef.current?.focus();
      return;
    }

    setInputName("");
    setIsSuggestOpen(false);
    onSearch(matchedName);
  };

  // ローマ字入力の変換途中（「りz」など）でも候補が消えないよう、末尾のアルファベットを除いて絞り込む
  const normalizedInput = normalizeSearchText(inputName.trim()).replace(/[a-z]+$/i, "");

  // 入力中の予測候補の配列
  const candidateNames =
    normalizedInput === ""
      ? []
      : Object.keys(pokemonSearchMap)
          .filter((name) => normalizeSearchText(name).includes(normalizedInput))
          .sort((a, b) => {
            // ろ -> ロコン よりも前にウォッシュロトム などが表示されてしまう不具合を解消
            const aStarts = normalizeSearchText(a).startsWith(normalizedInput);
            const bStarts = normalizeSearchText(b).startsWith(normalizedInput);
            // aに入力の先頭が含まれていてbが含まれていないならaを前にする(-1)
            if (aStarts && !bStarts) {
              return -1;
            }
            if (!aStarts && bStarts) {
              return 1;
            }
            return 0;
          })
          .slice(0, 10);

  return (
    <form className="flex gap-0 p-3 mx-auto " onSubmit={handleSubmit}>
      <div
        className="relative flex-1"
        onBlur={(event) => {
          if (event.currentTarget.contains(event.relatedTarget)) {
            return;
          }
          setIsSuggestOpen(false);
        }}
      >
        {/* 入力欄 */}
        <input
          ref={inputRef}
          placeholder="検索"
          className=" w-full rounded-l-xl bg-white dark:bg-slate-800 px-4 py-3 text-olive-700 dark:text-white font-semibold shadow-sm
            border border-olive-200 dark:border-amber-400
            border-r-2 border-r-olive-400
            focus:outline-none focus:ring-1 ring-inset
            focus:border-olive-400 focus:ring-olive-400
            dark:focus:border-amber-500 dark:focus:ring-amber-500
            transition
            "
          type="text"
          value={inputName}
          onChange={(event) => {
            setInputName(event.currentTarget.value);
            setIsSuggestOpen(true);
          }}
        />

        {/* 検索候補 */}
        {normalizedInput !== "" && isSuggestOpen && (
          <ul
            className="
              absolute z-50 top-full left-0 min-w-auto flex flex-col gap-0.5 mt-1 p-1.5 shadow-md
              border rounded-xl border-olive-300 dark:border-slate-400
              bg-taupe-100/80 dark:bg-slate-900/80
              "
            onMouseDown={(event) => event.preventDefault()}
          >
            {candidateNames.length > 0 ? (
              candidateNames.map((name, index) => (
                // フェードインアニメーション / 要素ごとに30msずつずらす
                <li key={name} className="animate-suggest-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                  <button
                    className="
                      w-full p-0.5 px-2 font-bold text-lg border rounded border-slate-700/15 dark:border-slate-200/20
                      hover:ring hover:ring-amber-50
                      bg-olive-50 dark:bg-slate-900
                      hover:bg-taupe-300 hover:text-black dark:hover:bg-amber-500 dark:hover:text-white
                      transition-colors
                      "
                    type="button"
                    // 押下された瞬間のイベントを拾う
                    onPointerDown={(event) => {
                      pointerTypeRef.current = event.pointerType;
                    }}
                    // 押下を離した瞬間
                    onClick={() => {
                      inputRef.current?.blur();
                      // windowsでの動作を確認できないためflushSyncを残す
                      flushSync(() => {
                        setInputName(name);
                        setIsSuggestOpen(false);
                      });
                      // モバイルはblurのまま / PCはfocus
                      if (pointerTypeRef.current === "mouse") {
                        inputRef.current?.focus();
                      }
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    {name}
                  </button>
                </li>
              ))
            ) : (
              <li className="text-red-400 dark:text-red-200">該当ポケモンなし</li>
            )}
          </ul>
        )}
      </div>

      {/* 検索ボタン */}
      <button
        className="font-bold px-4 py-3 rounded-r-xl border shadow-sm
          text-lg leading-none
          text-pink-400 dark:text-white
          border-l-0
          border-olive-200 bg-white
          dark:bg-none dark:bg-amber-500
          hover:bg-olive-200
          hover:dark:bg-amber-600
          active:translate-y-0.5 transition duration-200
          cursor-pointer
          "
        type="submit"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </form>
  );
};

export default PokemonSearchForm;
