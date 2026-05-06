import type { CSSProperties } from "react";

type SpinnerProps = {
  size?: number; // pixels
  className?: string;
  label?: string;
  style?: CSSProperties;
};

export function Spinner({ size = 36, className = "", label, style }: SpinnerProps) {
  const px = `${size}px`;
  return (
    <div className={["flex flex-col items-center justify-center", className].filter(Boolean).join(" ")} style={style}>
      <div
        role="status"
        aria-label={label ?? "Carregando"}
        className="inline-block animate-spin"
        style={{ width: px, height: px }}
      >
        <svg
          viewBox="0 0 50 50"
          fill="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="25" cy="25" r="20" stroke="rgba(0,0,0,0.08)" strokeWidth="6" />
          <path
            d="M45 25a20 20 0 0 1-20 20"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className=" text-surface-tint"
          />
        </svg>
      </div>
      {label ? <span className="mt-3 text-sm text-slate-600">{label}</span> : null}
    </div>
  );
}

export default Spinner;
