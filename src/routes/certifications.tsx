import { createFileRoute } from "@tanstack/react-router";
import { FutureSystemPage } from "../components/future/FutureSystemPage";

export const Route = createFileRoute("/certifications")({
  head: () => ({
    meta: [
      { title: "Certifications — Durai B" },
      { name: "description", content: "Credential archive of backend, cloud and IoT engineer Durai B." },
      { property: "og:title", content: "Certifications — Durai B" },
      { property: "og:description", content: "Credential archive of backend, cloud and IoT engineer Durai B." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/certifications" }],
  }),
  component: () => <FutureSystemPage index="07" title="CERTIFICATIONS" description="Durai's credential archive will be activated in a later phase of this system." />,
});
