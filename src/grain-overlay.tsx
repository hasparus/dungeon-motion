export function GrainOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-5 invert dark:invert-0 z-100">
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          filter: "contrast(170%) brightness(1000%)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
