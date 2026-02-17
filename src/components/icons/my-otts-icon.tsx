
import { cn } from "@/lib/utils"
import { Layers } from "lucide-react"

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
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.27a2 2 0 0 0 0 3.46l8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09a2 2 0 0 0 0-3.46z" />
      <path d="m2 12.27 8.57 4.09a2 2 0 0 0 1.66 0L22 12.27" />
      <path d="m2 17.27 8.57 4.09a2 2 0 0 0 1.66 0L22 17.27" />
    </svg>
  );
}
