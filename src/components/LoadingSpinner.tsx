type Props = {
  size: "sm" | "lg";
};

const sizeClassName = {
  sm: "size-4",
  lg: "size-10",
};

const LoadingSpinner = ({ size }: Props) => <span className={`${sizeClassName[size]} animate-spin rounded-full border-2 border-slate-300 border-t-pink-400 dark:border-t-orange-500`} aria-hidden="true" />;

export default LoadingSpinner;
