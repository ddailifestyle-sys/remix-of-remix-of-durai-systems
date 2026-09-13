export function EnvironmentFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="facility-grid absolute inset-0" />
      <div className="fallback-structure absolute right-[-16%] top-[13%] h-[68%] w-[68%] opacity-85 lg:right-[-3%] lg:w-[54%]" />
      <div className="absolute right-[8%] top-[24%] h-[38%] w-[34%] border border-primary/15 bg-surface/20 shadow-depth lg:right-[13%]">
        <div className="absolute inset-x-[8%] top-[12%] h-px bg-primary/50 shadow-signal" />
        <div className="absolute inset-x-[8%] top-[32%] h-px bg-border" />
        <div className="absolute inset-x-[8%] top-[52%] h-px bg-border" />
        <div className="absolute inset-x-[8%] top-[72%] h-px bg-border" />
      </div>
      <div className="absolute bottom-0 right-0 h-px w-[78%] bg-primary/25" />
    </div>
  );
}