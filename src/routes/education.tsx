import { createFileRoute } from "@tanstack/react-router";
import { FutureSystemPage } from "../components/future/FutureSystemPage";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Education — Durai B" },
      { name: "description", content: "Academic background of backend, cloud and IoT engineer Durai B." },
      { property: "og:title", content: "Education — Durai B" },
      { property: "og:description", content: "Academic background of backend, cloud and IoT engineer Durai B." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/education" }],
  }),
  component: () => <FutureSystemPage index="06" title="EDUCATION" description="Durai's academic record will be activated in a later phase of this system." />,
});
