import { SKILL_CATEGORIES } from "../../lib/skills";
import type { Skill, SkillCategoryId } from "../../types/skills";

interface Props {
  expanded: SkillCategoryId | null;
  onToggle: (id: SkillCategoryId) => void;
  onSelectSkill: (skill: Skill) => void;
  isMatch: (value: string) => boolean;
  searching: boolean;
}

export function SkillCategoryList({ expanded, onToggle, onSelectSkill, isMatch, searching }: Props) {
  return (
    <div className="grid gap-3">
      {SKILL_CATEGORIES.map((category) => {
        const open = expanded === category.id || (searching && category.skills.some((s) => isMatch(s.name)));
        return (
          <div key={category.id} className="border border-border/70 bg-surface/80 backdrop-blur-md">
            <h3>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => onToggle(category.id)}
                className="flex min-h-12 w-full items-center justify-between gap-4 px-4 text-left font-mono text-[0.66rem] tracking-[0.14em] transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>{category.label}</span>
                <span aria-hidden="true" className="text-primary">{open ? "▲" : "▼"}</span>
              </button>
            </h3>
            {open ? (
              <ul className="grid gap-px border-t border-border/70 bg-border/50 sm:grid-cols-2">
                {category.skills.map((skill) => (
                  <li key={skill.id} className="bg-background/80">
                    <button
                      type="button"
                      onClick={() => onSelectSkill(skill)}
                      className={`flex min-h-11 w-full items-center justify-between gap-3 px-4 text-left font-mono text-[0.62rem] tracking-[0.1em] transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        searching && isMatch(skill.name) ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <span>{skill.name}</span>
                      <span className="text-[0.52rem] tracking-[0.14em] text-muted-foreground">{skill.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
