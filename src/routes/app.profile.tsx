import { createFileRoute } from "@tanstack/react-router";
import { Award, Building2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { computeStats, initials, useStore } from "@/lib/store";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — IoT SimLab" },
      { name: "description", content: "Your participant details, stats and earned badges." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { state, update } = useStore();
  const team = state.team!;
  const stats = computeStats(state);
  const [about, setAbout] = useState(team?.about ?? "");
  const [motto, setMotto] = useState(team?.motto ?? "");

  const badges = [
    { label: "First Simulation", earned: stats.simsRun > 0 },
    { label: "First Submission", earned: stats.submitted > 0 },
    { label: "Three Problems", earned: stats.attempted >= 3 },
    { label: "Halfway There", earned: stats.completion >= 50 },
    { label: "High Scorer", earned: stats.score >= 70 },
  ];

  return (
    <div className="space-y-6">
      <div className="panel flex flex-wrap items-center gap-6 p-7">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-gradient text-2xl font-bold text-primary-foreground">
          {initials(team.teamName)}
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{team.teamName}</h1>
          <p className="mt-1 font-mono text-sm text-cyan">{team.teamId}</p>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" /> {team.college}
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> {team.email}
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> {team.phone}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Attempts", String(state.attempts.length)],
          ["Test Cases Passed", `${stats.testsPassed}/${stats.testsTotal || 0}`],
          ["Average Score", String(stats.score)],
          ["Problems Solved", String(stats.solved)],
        ].map(([k, v]) => (
          <div key={k} className="panel p-6">
            <p className="font-display text-2xl font-bold">{v}</p>
            <p className="mt-1 text-sm text-muted-foreground">{k}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="panel p-7">
          <h2 className="text-base font-semibold">Participant Details</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-primary-foreground">
                {initials(team.teamName || "NA")}
              </span>
              <div>
                <p className="text-sm font-medium">{team.teamName}</p>
                <p className="text-xs text-muted-foreground">
                  Participant · {team.email}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="panel p-7">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Award className="h-4 w-4 text-cyan" /> Badges
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.label}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  b.earned
                    ? "border-cyan/40 bg-cyan/10 text-cyan"
                    : "border-border text-muted-foreground"
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>

          <h2 className="mt-8 text-base font-semibold">About Me</h2>
          <textarea
            rows={3}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell others about yourself..."
            className="mt-3 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-cyan"
          />
          <input
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="Your motto"
            className="mt-3 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-cyan"
          />
          <button
            onClick={() => {
              update((s) => (s.team ? { ...s, team: { ...s.team, about, motto } } : s));
              toast.success("Profile updated");
            }}
            className="mt-3 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Save Profile
          </button>
        </section>
      </div>
    </div>
  );
}
