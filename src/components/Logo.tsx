export function Logo() {
  return (
    <div className="flex items-center gap-[1px] animate-fade-up">
      <div
        className="relative"
        style={{ width: "80px", height: "60px" }}
      >
        <img
          src="/yourel-logo.png"
          alt="Yourel Logo"
          className="w-full h-full object-contain"
        />
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          YOUREL
        </h1>
        <p className="text-sm text-muted-foreground -mt-1">
          Discover The Undiscovered
        </p>
      </div>
    </div>
  );
}
