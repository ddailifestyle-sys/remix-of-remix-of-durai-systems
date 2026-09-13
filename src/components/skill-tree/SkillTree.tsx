import { useCallback, useMemo, useState } from "react";
import { findCategory, SKILL_CATEGORIES, SKILL_RELATIONSHIPS } from "../../lib/skills";
import type { Skill, SkillCategoryId } from "../../types/skills";
import { SkillCategoryList } from "./SkillCategoryList";
import { SkillInfoPanel } from "./SkillInfoPanel";
import { SkillNetwork } from "./SkillNetwork";

export function SkillTree({ reducedMotion }: { reducedMotion: boolean }) {
  const [focus, setFocus] = useState<SkillCategoryId | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Skill | null>(null);
  const [expanded, setExpanded] = useState<SkillCategoryId | null>("languages");
  const [query, setQuery] = useState("");

  const searching = query.trim().length > 0;
  const isMatch = useCallback(
    (value: string) => value.toLowerCase().includes(query.trim().toLowerCase()),
    [query],
  );

  const matchCount = useMemo(
    () =>
      searching
        ? SKILL_CATEGORIES.reduce(
            (total, category) => total + category.skills.filter((s) => isMatch(s.name)).length,
            0,
          )
        : 0,
    [isMatch, searching],
  );

  const reset = () => {
    setFocus(null);
    setSelected(null);
    setHovered(null);
    setQuery("");
  };

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-border py-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Focus a technology category" className="flex flex-wrap gap-2">
          {SKILL_CATEGORIES.map((category) => {
            const active = focus === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFocus(active ? null : category.id)}
                className={`min-h-11 border px-4 font-mono text-[0.6rem] tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="lg:w-64">
            <label htmlFor="skill-search" className="sr-only">
              Search technologies
            </label>
            <input
              id="skill-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SEARCH TECHNOLOGIES..."
              className="min-h-11 w-full border border-border bg-background/70 px-4 font-mono text-[0.65rem] tracking-[0.12em] text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={reset}
            className="min-h-11 border border-border px-4 font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            RESET VIEW
          </button>
        </div>
      </div>

      <p aria-live="polite" className="mt-4 font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground">
        {searching
          ? `${matchCount} TECHNOLOGIES MATCH "${query.trim().toUpperCase()}"`
          : focus
            ? `FOCUS / ${findCategory(focus)?.label}`
            : "FULL ENGINEERING NETWORK"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Desktop network */}
        <div className="hidden lg:block">
          <SkillNetwork
            focus={focus}
            onFocus={setFocus}
            onSelectSkill={setSelected}
            hovered={hovered}
            onHover={setHovered}
            isMatch={isMatch}
            searching={searching}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Category list — primary on mobile, companion on desktop */}
        <div className="grid gap-6">
          <SkillCategoryList
            expanded={expanded}
            onToggle={(id) => setExpanded(expanded === id ? null : id)}
            onSelectSkill={setSelected}
            isMatch={isMatch}
            searching={searching}
          />

          {selected ? (
            <SkillInfoPanel
              skill={selected}
              category={findCategory(selected.category)}
              onClose={() => setSelected(null)}
            />
          ) : null}

          {SKILL_RELATIONSHIPS.map((relationship) => (
            <div key={relationship.label} className="border border-border/70 bg-surface/70 p-5 backdrop-blur-md">
              <p className="font-mono text-[0.56rem] tracking-[0.18em] text-primary">{relationship.label}</p>
              <ol className="mt-4 space-y-2">
                {relationship.chain.map((step) => (
                  <li key={step} className="font-mono text-[0.62rem] tracking-[0.12em] text-muted-foreground">
                    ▸ {step}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Conceptual relationship only — not a claim about any single project implementation.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
