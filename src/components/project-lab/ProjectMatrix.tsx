import { PROJECTS } from "../../lib/projects";

export function ProjectMatrix() {
  return (
    <section aria-labelledby="project-matrix-title" className="mt-16 border-t border-border pt-10">
      <h2 id="project-matrix-title" className="font-mono text-[0.62rem] tracking-[0.18em] text-primary">
        PROJECT MATRIX
      </h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="font-mono text-[0.58rem] tracking-[0.16em] text-muted-foreground">
              <th scope="col" className="border-b border-border py-3 pr-4 font-normal">PROJECT</th>
              <th scope="col" className="border-b border-border py-3 pr-4 font-normal">CATEGORY</th>
              <th scope="col" className="border-b border-border py-3 pr-4 font-normal">DEPLOYMENT</th>
              <th scope="col" className="border-b border-border py-3 font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((project) => (
              <tr key={project.id} className="align-top">
                <td className="border-b border-border/60 py-4 pr-4 font-display text-sm font-bold tracking-[0.05em]">
                  {project.name}
                </td>
                <td className="border-b border-border/60 py-4 pr-4 font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground">
                  {project.category}
                </td>
                <td className="border-b border-border/60 py-4 pr-4 font-mono text-[0.6rem] tracking-[0.12em]">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {project.liveLabel} ↗
                  </a>
                </td>
                <td className="border-b border-border/60 py-4 font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground">
                  {project.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
