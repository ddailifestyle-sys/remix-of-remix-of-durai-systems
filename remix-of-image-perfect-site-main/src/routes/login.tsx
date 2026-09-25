import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Cpu, Eye, EyeOff, Lock, Mail, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import authImg from "@/assets/auth-hero.jpg";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { makeTeamId, useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — IoT SimLab" },
      {
        name: "description",
        content: "Sign in to your IoT SimLab team account to continue your simulation challenge.",
      },
      { property: "og:title", content: "Login — IoT SimLab" },
      { property: "og:description", content: "Login to your IoT journey." },
    ],
  }),
  component: LoginPage,
});

const FIELD =
  "w-full rounded-xl border border-input bg-background py-3 pl-11 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-cyan";

const HIGHLIGHTS = [
  { icon: Cpu, title: "Virtual Hardware", text: "ESP32, sensors and displays ready to wire." },
  { icon: Zap, title: "Instant Simulation", text: "Run and debug without any installation." },
  { icon: ShieldCheck, title: "Progress Saved", text: "Your circuits and scores persist locally." },
];

function LoginPage() {
  const navigate = useNavigate();
  const { state, update, logActivity } = useStore();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const team = state.team;
    if (!team) {
      toast.error("No team found on this device. Please register first.");
      return;
    }
    if (team.email.toLowerCase() !== form.email.toLowerCase() || team.password !== form.password) {
      toast.error("Invalid email or password.");
      return;
    }
    logActivity(`${team.teamName} signed in`);
    toast.success(`Welcome back, ${team.teamName}!`);
    navigate({ to: "/app" });
  };

  const guest = () => {
    update((s) => ({
      ...s,
      team:
        s.team ??
        {
          teamName: "Team Alpha",
          teamId: makeTeamId("Team Alpha"),
          teamSize: "4",
          college: "Institute of Technology",
          department: "Electronics & Communication",
          email: "alpha@iotsimlab.com",
          phone: "+91 98765 43210",
          password: "demo1234",
          members: [
            { name: "Aarav Sharma", role: "Team Leader", email: "aarav@college.edu" },
            { name: "Diya Patel", role: "Member", email: "diya@college.edu" },
            { name: "Rohan Mehta", role: "Member", email: "rohan@college.edu" },
            { name: "Isha Nair", role: "Member", email: "isha@college.edu" },
          ],
          about: "Four final-year students building connected systems.",
          motto: "Simulate first, ship confidently.",
          registeredAt: new Date().toISOString(),
        },
    }));
    toast.success("Signed in with the demo team.");
    navigate({ to: "/app" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left */}
      <div className="hero-glow relative hidden flex-col justify-between border-r border-border p-10 lg:flex">
        <Logo />
        <div>
          <img
            src={authImg}
            width={1024}
            height={1280}
            alt="IoT hardware kit with ESP32 board, breadboard and sensors"
            className="w-full max-w-md rounded-3xl border border-border object-cover"
          />
          <h2 className="mt-8 text-3xl font-extrabold">
            Login to Your <span className="text-gradient">IoT Journey</span>
          </h2>
          <div className="mt-6 space-y-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
                  <h.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p className="text-sm text-muted-foreground">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 IoT SimLab</p>
      </div>

      {/* Right */}
      <div className="flex flex-col justify-center px-5 py-12 sm:px-12">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-md">
          <div className="hidden justify-end lg:flex">
            <ThemeToggle />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your team credentials to access the dashboard.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                required
                type="email"
                className={FIELD}
                placeholder="Team email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                required
                type={show ? "text" : "password"}
                className={FIELD}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                aria-label="Toggle password"
                onClick={() => setShow((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="accent-[var(--blue)]" /> Remember me
              </label>
              <Link to="/contact" className="text-cyan hover:underline">
                Forgot password?
              </Link>
            </div>
            <button className="w-full rounded-xl bg-brand-gradient py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
              Login
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={guest}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface py-3.5 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6c-.1 1.1-.9 2.8-2.5 3.9l3.8 2.9c2.2-2 3.6-5 3.6-8.7z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.9-5l-4 3.1C3.2 21.3 7.3 24 12 24z"
              />
              <path fill="#FBBC05" d="M5.1 14.4a7.4 7.4 0 0 1 0-4.8l-4-3.1a12 12 0 0 0 0 11z" />
              <path
                fill="#EA4335"
                d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.4-3.3C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.1 6.5l4 3.1c1-2.9 3.7-4.9 6.9-4.9z"
              />
            </svg>
            Login with Google
          </button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="font-semibold text-cyan hover:underline">
              Register your team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
