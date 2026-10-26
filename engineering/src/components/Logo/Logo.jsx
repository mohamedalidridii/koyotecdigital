import { useId } from "react";

// the Koyotec mark (same strokes as the main site's nav logo), ink lines with the red square
export default function Logo({ color = "var(--base-500)", className = "" }) {
  const clip = useId();
  return (
    <svg
      width="250"
      height="195"
      viewBox="0 0 250 195"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clip}>
          <rect width="250" height="194.5" />
        </clipPath>
      </defs>
      <g stroke={color} strokeWidth="18" clipPath={`url(#${clip})`}>
        <path d="M220.5 10C175.75 9.25 132.75 31 92 90.25L19.66 206" />
        <path d="M79 1.5V72.5M80 112V206" />
        <path d="M142.1 106L233.1 206" />
        <path d="M1 104H246" strokeWidth="17" />
      </g>
      <rect x="232" y="2" width="18" height="18" fill="var(--base-300)" />
    </svg>
  );
}
