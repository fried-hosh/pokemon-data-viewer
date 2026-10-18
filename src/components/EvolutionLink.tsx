import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  pokemonName: string;
  isPending: boolean;
  onSelect: (pokemonName: string) => Promise<void>;
  className: string;
  children: ReactNode;
  tabIndex?: number;
};

const EvolutionLink = ({ pokemonName, isPending, onSelect, className, children, tabIndex }: Props) => {
  return (
    <Link
      to={`/pokemon/${pokemonName}`}
      onClick={(event) => {
        // cmd + クリック 等による操作は許可
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        // 通常クリックによるLink自身の遷移を止め、onSelectのタイミングで移動する
        event.preventDefault();

        if (isPending) return;
        onSelect(pokemonName);
      }}
      className={className}
      tabIndex={tabIndex}
    >
      {children}
    </Link>
  );
};

export default EvolutionLink;
