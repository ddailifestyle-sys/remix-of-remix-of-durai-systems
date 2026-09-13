import { SKILL_CATEGORIES } from "../../lib/skills";
import type { Skill, SkillCategory, SkillCategoryId } from "../../types/skills";

interface Props {
  focus: SkillCategoryId | null;
  onFocus: (id: SkillCategoryId | null) => void;
  onSelectSkill: (skill: Skill) => void;
  hovered: string | null;
  onHover: (id: string | null) => void;
  isMatch: (value: string) => boolean;
  searching: boolean;
  reducedMotion: boolean;
}

const RADIUS_X = 36;
const RADIUS_Y = 34;

function position(angle: number, rx = RADIUS_X, ry = RADIUS_Y) {
  const rad = (angle * Math.PI) / 180;
  return { x: 50 + Math.cos(rad) * rx, y: 50 + Math.sin(rad) * ry };
}

export function SkillNetwork({
  focus,
  onFocus,
  onSelectSkill,
  hovered,
  onHover,
  isMatch,
  searching,
  reducedMotion,
}: Props) {
  const focused: SkillCategory | undefined = focus
    ? SKILL_CATEGORIES.find((c) => c.id === focus)
    : undefined;

  const items = focused
    ? focused.skills.map((skill, i, arr) => ({
        key: skill.id,
        label: skill.name,
        sub: skill.type,
        skill,
        ...position(-90 + (360 / arr.length) * i, 34, 33),
      }))
    : SKILL_CATEGORIES.map((category) => ({
        key: category.id,
        label: category.shortLabel,
        sub: `${category.skills.length} TECHNOLOGIES`,
        category,
        ...position(category.angle),
      }));

  return (
    <div className="relative h-[680px] overflow-hidden border border-border/70 bg-command/60">
      <div className="command-grid absolute inset-0 opacity-40" aria-hidden="true" />

      <svg className="absolute inset-0 size-full" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
        {items.map((item) => {
          const active = hovered === item.key;
          const match = searching ? isMatch(item.label) : true;
          return (
            <line
              key={item.key}
              x1="50"
              y1="50"
              x2={item.x}
              y2={item.y}
              stroke="var(--primary)"
              strokeWidth={active ? 0.35 : 0.15}
              strokeDasharray="1.4 1.4"
              opacity={active ? 0.9 : match ? 0.35 : 0.1}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`grid size-40 place-items-center rounded-full border border-primary/50 bg-background/80 text-center backdrop-blur-md ${
            reducedMotion ? "" : "core-pulse-ring"
          }`}
        >
          <div>
            <p className="font-display text-lg font-bold tracking-[0.1em]">
              {focused ? focused.shortLabel : "DURAI"}
            </p>
            <p className="mt-1 font-mono text-[0.5rem] tracking-[0.16em] text-primary">
              {focused ? "CATEGORY FOCUS" : "ENGINEERING CORE"}
            </p>
          </div>
        </div>
      </div>

      {items.map((item) => {
        const active = hovered === item.key;
        const match = searching ? isMatch(item.label) : true;
        const dimmed = !match || (hovered !== null && !active);
        const common = `absolute w-40 -translate-x-1/2 -translate-y-1/2 border bg-surface/90 px-3 py-3 text-left backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          active ? "border-primary/70 shadow-signal" : "border-border/70"
        } ${dimmed ? "opacity-40" : "opacity-100"}`;

        return (
          <button
            key={item.key}
            type="button"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            className={common}
            onMouseEnter={() => onHover(item.key)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(item.key)}
            onBlur={() => onHover(null)}
            onClick={() => {
              if ("category" in item && item.category) onFocus(item.category.id);
              else if ("skill" in item && item.skill) onSelectSkill(item.skill);
            }}
          >
            <span className="block font-display text-[0.8rem] font-bold tracking-[0.06em]">{item.label}</span>
            <span className="mt-1 block font-mono text-[0.52rem] tracking-[0.12em] text-muted-foreground">
              {item.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
