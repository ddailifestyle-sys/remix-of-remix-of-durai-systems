import { motion } from "framer-motion";
import { EnvironmentLayer } from "../environment/EnvironmentLayer";
import { SystemButton } from "../ui/SystemButton";

export function HeroSection({ reducedMotion }: { reducedMotion: boolean }) {
  const enterSystem = () => document.getElementById("command-center")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  return (
    <section className="relative isolate flex min-h-[min(900px,100dvh)] items-end overflow-hidden border-b border-border pt-24 lg:items-center" aria-labelledby="hero-title">
      <EnvironmentLayer reducedMotion={reducedMotion} />
      <div className="atmosphere absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-1 items-end gap-12 px-5 pb-12 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.55fr)] lg:px-10 lg:pb-16">
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 font-mono text-[0.65rem] tracking-[0.2em] text-primary"><span className="size-1.5 bg-primary shadow-signal" />ENGINEER PROFILE / ACTIVE</div>
          <h1 id="hero-title" className="font-display text-[clamp(3.5rem,9vw,8.5rem)] font-bold leading-[0.78] tracking-[0.02em] text-foreground">DURAI B</h1>
          <div className="mt-7 border-l border-primary/70 pl-5 sm:pl-7">
            <p className="font-display text-xl font-bold tracking-[0.08em] text-foreground sm:text-3xl">BACKEND ENGINEER</p>
            <p className="mt-2 font-display text-sm font-semibold tracking-[0.12em] text-muted-foreground sm:text-lg">CLOUD DEVELOPER <span className="mx-2 text-primary">/</span> IoT SYSTEMS ENGINEER</p>
          </div>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Building scalable backend systems, cloud-native applications, and intelligent IoT solutions.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><SystemButton onClick={enterSystem}>ENTER SYSTEM</SystemButton><SystemButton to="/resume" kind="secondary">VIEW RESUME</SystemButton></div>
        </motion.div>
        <aside className="grid grid-cols-2 gap-px border border-border bg-border/70 lg:grid-cols-1" aria-label="Portfolio system status">
          {[['SYSTEM STATUS','ONLINE'],['ENGINEERING CORE','ACTIVE'],['NETWORK','CONNECTED'],['LOCATION','TAMIL NADU, INDIA']].map(([label,value]) => <div key={label} className="min-w-0 bg-background/70 p-4 backdrop-blur-md sm:p-5"><p className="font-mono text-[0.58rem] tracking-[0.18em] text-muted-foreground">{label}</p><p className="mt-2 truncate font-mono text-[0.68rem] tracking-[0.12em] text-foreground"><span className="mr-2 inline-block size-1.5 bg-primary shadow-signal" />{value}</p></div>)}
        </aside>
      </div>
      <div className="absolute bottom-0 left-1/2 hidden h-9 w-px bg-primary/60 lg:block" aria-hidden="true" />
    </section>
  );
}