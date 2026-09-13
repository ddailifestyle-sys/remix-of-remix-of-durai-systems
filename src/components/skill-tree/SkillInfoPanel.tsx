import type { Skill, SkillCategory } from "../../types/skills";

interface Props {
  skill: Skill;
  category: SkillCategory | undefined;
  onClose: () => void;
}

export function SkillInfoPanel({ skill, category, onClose }: Props) {
  return (
    <aside
      aria-label={`Technical information for ${skill.name}`}
      className="border border-primary/50 bg-surface/90 p-5 backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-bold tracking-[0.06em]">{skill.name.toUpperCase()}</h3>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 border border-border px-3 font-mono text-[0.58rem] tracking-[0.14em] text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          CLOSE
        </button>
      </div>
      <dl className="mt-5 grid gap-px bg-border/60">
        {[
          ["CATEGORY", category?.label ?? "—"],
          ["TYPE", skill.type],
          ["RELATED SYSTEM", category?.relatedSystem ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 bg-background/80 p-3">
            <dt className="font-mono text-[0.56rem] tracking-[0.14em] text-muted-foreground">{label}</dt>
            <dd className="font-mono text-[0.62rem] tracking-[0.1em]">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
