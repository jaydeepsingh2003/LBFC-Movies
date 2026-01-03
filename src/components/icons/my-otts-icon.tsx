
import { cn } from "@/lib/utils"

export function MyOttsIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      {...props}
    >
      <defs>
        <linearGradient id="my-otts-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: 'rgb(255,0,0)', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: 'rgb(0,255,0)', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: 'rgb(0,0,255)', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <polygon points="12 2 2 7 12 12 22 7 12 2" fill="url(#my-otts-gradient)" stroke="url(#my-otts-gradient)"/>
      <polyline points="2 17 12 22 22 17"  stroke="url(#my-otts-gradient)"/>
      <polyline points="2 12 12 17 22 12"  stroke="url(#my-otts-gradient)"/>
    </svg>
  );
}
