import { cn } from "@/lib/utils";

/**
 * CinevexiaLogo component rendering the custom V-Frame and play symbol logo.
 */
export function CinevexiaLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-full", className)}
    >
      <defs>
        <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect x="16" y="16" width="480" height="480" rx="110" fill="#0B0B0F"/>

      <g filter="url(#logo-glow)">
        <path d="M170 150 L230 360 L260 360 L210 150 Z" fill="#FF2A2A"/>
        <path d="M302 150 L242 360 L272 360 L332 150 Z" fill="#FF2A2A"/>
      </g>

      <polygon points="250,230 285,255 250,280" fill="#0B0B0F"/>
    </svg>
  );
}
