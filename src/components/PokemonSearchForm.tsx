import { useState } from "react";

type Props = {
  onSearch: (name: string) => void;
};

const PokemonSearchForm = ({ onSearch }: Props) => {
  const [inputName, setInputName] = useState("");

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = inputName.trim();
    if (trimmedName === "") {
      return;
    }

    onSearch(trimmedName);
  };
  return (
    <div>
      <form className="flex gap-2 p-6 mx-auto max-w-xl" onSubmit={handleSubmit}>
        <input
          className="flex-1 rounded-xl border border-amber-300 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition"
          type="text"
          value={inputName}
          onChange={(event) => {
            setInputName(event.currentTarget.value);
          }}
        />
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
