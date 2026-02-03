import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  width?: number;
  height?: number;
}

export function Logo({ className, showText = false, width = 32, height = 32}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <Image src="/images/Logo.png" alt="Libelit" width={width} height={height} />
      {showText && (
        <span className="font-semibold text-xl tracking-tight">libelit</span>
      )}
    </div>
  );
}
