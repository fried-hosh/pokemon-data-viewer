import { useState } from "react";
import { pokemonSearchMap } from "../lib/pokemonSearchMap";
import { normalizeSearchText } from "../lib/normalizeSearchText";

type Props = {
  onSearch: (name: string) => void;
};

const PokemonSearchForm = ({ onSearch }: Props) => {
  const [inputName, setInputName] = useState("");
  // 検索候補
  const [isSuggestOpen, setIsSuggestOpen] = useState<boolean>(true);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = inputName.trim();
    if (trimmedName === "") {
      return;
    }
    if (!Object.hasOwn(pokemonSearchMap, trimmedName)) {
      setIsSuggestOpen(true);
      return;
    }

    setInputName("");
    setIsSuggestOpen(false);
    onSearch(trimmedName);
  };

  const normalizedInput = normalizeSearchText(inputName.trim());

  // 入力中の予測候補の配列
  const candidateNames =
    normalizedInput === ""
      ? []
      : Object.keys(pokemonSearchMap)
          .filter((name) => normalizeSearchText(name).includes(normalizedInput))
          .slice(0, 10);

  return (
    <div>
      <form className="flex gap-2 p-6 mx-auto max-w-xl" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <input
            className=" w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition"
            type="text"
            value={inputName}
            onChange={(event) => {
              setInputName(event.currentTarget.value);
              setIsSuggestOpen(true);
            }}
            onBlur={() => setIsSuggestOpen(false)}
          />

          {/* 検索候補 */}
          {candidateNames.length > 0 && isSuggestOpen && (
            <ul
              className="
            absolute z-10 top-full left-0 min-w-auto flex flex-col gap-0.5 mt-1 p-1.5 shadow-md
            border rounded-xl border-amber-300 dark:border-slate-400
            bg-amber-100/80 dark:bg-slate-900/80
            "
              onMouseDown={(event) => event.preventDefault()}
            >
              {candidateNames.map((name, index) => (
                // フェードインアニメーション / 要素ごとに30msずつずらす
                <li key={name} className="animate-suggest-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                  <button
                    className="
                    w-full p-0.5 px-2 font-bold text-lg border rounded border-slate-700/15 dark:border-slate-200/20
                    hover:ring hover:ring-amber-50
                    bg-yellow-50 dark:bg-slate-900
                    hover:bg-amber-400 hover:text-black dark:hover:bg-amber-500 dark:hover:text-white
                    transition-colors
                    "
                    type="button"
                    onClick={() => {
                      setInputName(name);
                      setIsSuggestOpen(false);
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className="font-bold text-white px-5 py-3 rounded-xl border border-amber-500 bg-amber-500
          text-lg leading-none
         hover:bg-amber-600 hover:shadow-md shadow-sm active:translate-y-0.5 transition focus-visible:outline-*"
          type="submit"
        >
          検索
        </button>
      </form>
    </div>
  );
};

export default PokemonSearchForm;
