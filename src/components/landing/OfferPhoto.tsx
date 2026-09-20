export function OfferPhoto({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 200"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="offerPhotoBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e3f6ec" />
          <stop offset="100%" stopColor="#bfe8d3" />
        </linearGradient>
        <linearGradient id="bagPrimary" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f8a5c" />
          <stop offset="100%" stopColor="#166849" />
        </linearGradient>
        <linearGradient id="bagAccent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a6e06a" />
          <stop offset="100%" stopColor="#8fd34f" />
        </linearGradient>
      </defs>

      <rect width="360" height="200" fill="url(#offerPhotoBg)" />
      <circle cx="300" cy="30" r="90" fill="#ffffff" opacity="0.18" />
      <circle cx="40" cy="185" r="70" fill="#ffffff" opacity="0.14" />

      {/* backdrop shadow */}
      <ellipse cx="185" cy="176" rx="110" ry="12" fill="#0f1f18" opacity="0.08" />

      {/* left bag (accent) */}
      <g transform="translate(120 62)">
        <rect x="0" y="18" width="72" height="82" rx="8" fill="url(#bagAccent)" />
        <path
          d="M14 18 V4 a22 22 0 0 1 44 0 V18"
          fill="none"
          stroke="#3f7a1c"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <rect x="16" y="42" width="40" height="6" rx="3" fill="#ffffff" opacity="0.55" />
      </g>

      {/* right bag (primary) */}
      <g transform="translate(184 40)">
        <rect x="0" y="22" width="86" height="98" rx="9" fill="url(#bagPrimary)" />
        <path
          d="M16 22 V5 a27 27 0 0 1 54 0 V22"
          fill="none"
          stroke="#0f3d2a"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="18" y="50" width="50" height="7" rx="3.5" fill="#ffffff" opacity="0.5" />
        <rect x="18" y="66" width="34" height="7" rx="3.5" fill="#ffffff" opacity="0.35" />
      </g>

      {/* sparkle accents */}
      <g fill="#ffffff">
        <path d="M60 46 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" opacity="0.85" />
        <path d="M290 120 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" opacity="0.7" />
        <circle cx="270" cy="55" r="4" opacity="0.7" />
        <circle cx="50" cy="140" r="3.5" opacity="0.6" />
      </g>
    </svg>
  );
}
