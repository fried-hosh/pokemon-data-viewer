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
    <div>
      <form className="flex gap-2 p-4 mx-auto max-w-xl" onSubmit={handleSubmit}>
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
            className=" w-full rounded-xl bg-white dark:bg-slate-800 px-4 py-3 text-olive-700 dark:text-white font-semibold shadow-sm
            border border-olive-300 dark:border-amber-300
            focus:outline-none focus:ring-2
            focus:border-olive-400 focus:ring-olive-400
            dark:focus:border-amber-400 dark:focus:ring-amber-200
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
          className="font-bold px-5 py-3 rounded-xl border
         text-lg leading-none
         text-white dark:text-white
         border-olive-400 bg-stone-400
         dark:border-amber-500 dark:bg-amber-500 hover:bg-stone-600
         dark:hover:bg-amber-600 hover:shadow-md shadow-sm active:translate-y-0.5 transition
         cursor-pointer
         "
          type="submit"
        >
          検索
        </button>
      </form>
    </div>
  );
};

export default PokemonSearchForm;
