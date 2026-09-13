import type { Project, ProjectCategory } from "../types/projects";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: "all", label: "ALL PROJECTS" },
  { id: "full-stack", label: "FULL-STACK" },
  { id: "ai-healthcare", label: "AI / HEALTHCARE" },
  { id: "event", label: "EVENT" },
  { id: "iot", label: "IoT" },
  { id: "erp", label: "ERP" },
];

export const PROJECTS: Project[] = [
  {
    id: "geanexa",
    number: "01",
    name: "GEANEXA",
    category: "FULL-STACK WEB PLATFORM",
    categoryId: "full-stack",
    description:
      "A deployed web platform demonstrating full-stack development, responsive UI, backend integration, and production deployment.",
    liveUrl: "https://geanexa.vercel.app",
    liveLabel: "geanexa.vercel.app",
    status: "DEPLOYED",
    visualization: "fullstack",
    x: 50,
    y: 10,
  },
  {
    id: "helpio2",
    number: "02",
    name: "HELPIO2",
    category: "AI / HEALTHCARE PLATFORM",
    categoryId: "ai-healthcare",
    description:
      "A web-based healthcare platform focused on AI-assisted functionality and user-facing workflows.",
    liveUrl: "https://4helpio.vercel.app",
    liveLabel: "4helpio.vercel.app",
    status: "DEPLOYED",
    visualization: "ai",
    x: 13,
    y: 40,
  },
  {
    id: "symphosiyam",
    number: "03",
    name: "SYMPHOSIYAM",
    category: "EVENT / WEB PLATFORM",
    categoryId: "event",
    description:
      "A deployed web platform built for the Symphosiyam initiative, featuring a modern responsive interface and interactive user experience.",
    liveUrl: "https://exclade2k26.web.app",
    liveLabel: "exclade2k26.web.app",
    status: "DEPLOYED",
    visualization: "event",
    x: 87,
    y: 40,
  },
  {
    id: "iot-simulation",
    number: "04",
    name: "ADVANCED IoT SIMULATION PLATFORM",
    category: "IoT / SIMULATION / LEARNING",
    categoryId: "iot",
    description:
      "An interactive IoT simulation platform with practical tasks and simulations for learning and experimenting with IoT concepts.",
    liveUrl: "https://ksrceiotsim.vercel.app",
    liveLabel: "ksrceiotsim.vercel.app",
    status: "DEPLOYED",
    visualization: "iot",
    x: 24,
    y: 86,
  },
  {
    id: "ksrce-erp",
    number: "05",
    name: "KSRCE FULL ERP SYSTEM",
    category: "COLLEGE ERP DEMO",
    categoryId: "erp",
    description:
      "A full college ERP demonstration covering academic and institutional workflows, designed as a unified campus management platform.",
    liveUrl: "https://ksrce-campus-stack.web.app",
    liveLabel: "ksrce-campus-stack.web.app",
    status: "DEPLOYED",
    visualization: "erp",
    x: 76,
    y: 86,
  },
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}

export const PROJECT_EMPTY_STATE =
  "Additional technical details are not currently available.";
