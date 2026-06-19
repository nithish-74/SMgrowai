import { cn } from "@/lib/utils";

export function HeroOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Purple Orb */}
      <div
        className={cn(
          "absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-60 blur-[100px] animate-pulse"
        )}
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
        }}
      />
      
      {/* Lime Orb */}
      <div
        className={cn(
          "absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-60 blur-[100px] animate-pulse"
        )}
        style={{
          background: "radial-gradient(circle, rgba(184, 255, 87, 0.35) 0%, transparent 70%)",
          animationDelay: "1s",
        }}
      />
    </div>
  );
}
