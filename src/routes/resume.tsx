import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, FileClock } from "lucide-react";

export const Route = createFileRoute("/resume")({
  head: () => ({ meta: [{ title: "Resume — Durai B" }, { name: "description", content: "Resume destination for backend, cloud and IoT engineer Durai B." }, { property: "og:title", content: "Resume — Durai B" }, { property: "og:description", content: "Resume destination for backend, cloud and IoT engineer Durai B." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "/resume" }] }),
  component: ResumePage,
});

function ResumePage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-command px-5 py-24">
      <div className="command-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative w-full max-w-3xl border-y border-border py-12">
        <FileClock aria-hidden="true" className="size-10 text-primary" />
        <p className="mt-7 font-mono text-[0.65rem] tracking-[0.2em] text-primary">RESUME SYSTEM / LINK PREPARED</p>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-[0.04em] sm:text-7xl">RESUME</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">The resume destination is ready. No document was attached, so no file has been invented or linked.</p>
        <Link to="/" className="mt-10 inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.68rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft aria-hidden="true" className="size-4" />RETURN HOME</Link>
      </div>
    </main>
  );
}