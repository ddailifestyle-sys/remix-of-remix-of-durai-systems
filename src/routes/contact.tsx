import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ContactPanel } from "../components/profile/ContactPanel";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Durai B" },
      { name: "description", content: "Contact Durai B, backend engineer, cloud developer and IoT systems engineer based in Tamil Nadu, India." },
      { property: "og:title", content: "Contact — Durai B" },
      { property: "og:description", content: "Contact Durai B, backend engineer, cloud developer and IoT systems engineer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-command px-5 py-24 sm:px-8 lg:px-10">
      <div className="command-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-primary">SYSTEM 09 / DIRECT CHANNEL</p>
        <h1 className="mt-5 font-display text-5xl font-bold tracking-[0.04em] sm:text-6xl">CONTACT</h1>
        <p className="mt-6 text-base leading-7 text-muted-foreground">Reach Durai B directly through any of the channels below.</p>
        <div className="mt-10"><ContactPanel /></div>
        <Link to="/" hash="command-center" className="mt-10 inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.68rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft aria-hidden="true" className="size-4" />COMMAND CENTER
        </Link>
      </div>
    </main>
  );
}
