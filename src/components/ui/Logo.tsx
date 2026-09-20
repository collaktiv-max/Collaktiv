export function Logo({
  className = "",
  textClassName = "",
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <div className={`flex items-center ${className}`}>
      <span
        className={`font-extrabold text-lg tracking-tight text-[var(--color-brand-primary)] ${textClassName}`}
      >
        COLLAKTIV
      </span>
    </div>
  );
}
