import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { makeTeamId, useStore, type Team } from "@/lib/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register Your Team — IoT SimLab" },
      {
        name: "description",
        content:
          "Join IoT SimLab: register your college team in three steps — team info, team members, then verify and submit.",
      },
      { property: "og:title", content: "Register Your Team — IoT SimLab" },
      { property: "og:description", content: "Join IoT SimLab in three simple steps." },
    ],
  }),
  component: RegisterPage,
});

const FIELD =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-cyan";
const LABEL = "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

const STEPS = ["Team Info", "Team Members", "Verify & Submit"];

function RegisterPage() {
  const navigate = useNavigate();
  const { update, logActivity } = useStore();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({
    teamName: "",
    teamSize: "3",
    college: "",
    department: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [members, setMembers] = useState([
    { name: "", role: "Team Leader", email: "" },
    { name: "", role: "Member", email: "" },
  ]);
  const [agree, setAgree] = useState(false);

  const next = (): void => {
    if (step === 0) {
      const required = ["teamName", "college", "department", "email", "phone", "password"] as const;
      if (required.some((k) => !info[k].trim())) {
        toast.error("Please fill all team fields.");
        return;
      }
      if (info.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (info.password !== info.confirm) {
        toast.error("Passwords do not match.");
        return;
      }
    }
    if (step === 1) {
      if (members.length < 2) {
        toast.error("A team needs at least 2 members.");
        return;
      }
      if (members.some((m) => !m.name.trim() || !m.email.trim())) {
        toast.error("Please complete every member's details.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const submit = (): void => {
    if (!agree) {
      toast.error("Please accept the rules to continue.");
      return;
    }
    const team: Team = {
      teamName: info.teamName,
      teamId: makeTeamId(info.teamName),
      teamSize: String(members.length),
      college: info.college,
      department: info.department,
      email: info.email,
      phone: info.phone,
      password: info.password,
      members,
      about: "",
      motto: "",
      registeredAt: new Date().toISOString(),
    };
    update((s) => ({ ...s, team }));
    logActivity(`${team.teamName} registered for the challenge`);
    toast.success(`Team registered! Your team ID is ${team.teamId}`);
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="text-sm font-semibold text-cyan hover:underline">
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-center text-3xl font-extrabold sm:text-4xl">
          Join <span className="text-gradient">IoT SimLab</span>
        </h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Register your team in three quick steps.
        </p>

        {/* Stepper */}
        <div className="mt-10 flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    i <= step
                      ? "bg-brand-gradient text-primary-foreground"
                      : "border border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:block ${i <= step ? "" : "text-muted-foreground"}`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={`mx-4 h-px flex-1 ${i < step ? "bg-brand-gradient" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="panel mt-8 p-7">
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL}>Team Name</label>
                <input
                  className={FIELD}
                  placeholder="e.g. Team Alpha"
                  value={info.teamName}
                  onChange={(e) => setInfo({ ...info, teamName: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL}>Team Size</label>
                <select
                  className={FIELD}
                  value={info.teamSize}
                  onChange={(e) => setInfo({ ...info, teamSize: e.target.value })}
                >
                  {["2", "3", "4"].map((n) => (
                    <option key={n} value={n}>
                      {n} members
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL}>Department</label>
                <input
                  className={FIELD}
                  placeholder="e.g. Electronics"
                  value={info.department}
                  onChange={(e) => setInfo({ ...info, department: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL}>College / Institution</label>
                <input
                  className={FIELD}
                  placeholder="College name"
                  value={info.college}
                  onChange={(e) => setInfo({ ...info, college: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL}>Team Email</label>
                <input
                  type="email"
                  className={FIELD}
                  placeholder="team@college.edu"
                  value={info.email}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL}>Phone</label>
                <input
                  className={FIELD}
                  placeholder="+91 00000 00000"
                  value={info.phone}
                  onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL}>Password</label>
                <input
                  type="password"
                  className={FIELD}
                  placeholder="Minimum 6 characters"
                  value={info.password}
                  onChange={(e) => setInfo({ ...info, password: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL}>Confirm Password</label>
                <input
                  type="password"
                  className={FIELD}
                  placeholder="Repeat password"
                  value={info.confirm}
                  onChange={(e) => setInfo({ ...info, confirm: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              {members.map((m, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface-2 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Member {i + 1} {i === 0 && <span className="text-cyan">· Team Leader</span>}
                    </p>
                    {i > 1 && (
                      <button
                        onClick={() => setMembers(members.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input
                      className={FIELD}
                      placeholder="Full name"
                      value={m.name}
                      onChange={(e) =>
                        setMembers(
                          members.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                        )
                      }
                    />
                    <input
                      type="email"
                      className={FIELD}
                      placeholder="Email"
                      value={m.email}
                      onChange={(e) =>
                        setMembers(
                          members.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              {members.length < 4 && (
                <button
                  onClick={() => setMembers([...members, { name: "", role: "Member", email: "" }])}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent"
                >
                  <Plus className="h-4 w-4" /> Add member
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Team Name", info.teamName],
                  ["College", info.college],
                  ["Department", info.department],
                  ["Email", info.email],
                  ["Phone", info.phone],
                  ["Members", String(members.length)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border bg-surface-2 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                    <p className="mt-1 text-sm font-medium">{v}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {members.map((m, i) => (
                  <li key={i}>
                    {i + 1}. {m.name} — {m.email} {i === 0 && "(Leader)"}
                  </li>
                ))}
              </ul>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 accent-[var(--blue)]"
                />
                <span>
                  I confirm the details are correct and my team accepts the{" "}
                  <Link to="/rules" className="text-cyan hover:underline">
                    rules & guidelines
                  </Link>
                  .
                </span>
              </label>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < 2 ? (
              <button
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Submit Registration <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
