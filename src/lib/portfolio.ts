import type { BootCheck, SystemNode } from "../types/portfolio";

export const BOOT_CHECKS: BootCheck[] = [
  { label: "BACKEND CORE", value: "ONLINE" },
  { label: "CLOUD CORE", value: "ONLINE" },
  { label: "IoT CORE", value: "ONLINE" },
  { label: "DATABASE CORE", value: "ONLINE" },
  { label: "NETWORK", value: "ONLINE" },
];

export const SYSTEM_NODES: SystemNode[] = [
  { id: "profile", index: "01", label: "PROFILE", status: "IDENTITY READY", description: "Professional profile and engineering approach", path: "/profile" },
  { id: "skills", index: "02", label: "SKILLS", status: "MAPPING READY", description: "Backend, cloud and IoT capabilities", path: "/skills" },
  { id: "projects", index: "03", label: "PROJECTS", status: "ARCHIVE READY", description: "Selected systems and technical work", path: "/projects" },
  { id: "experience", index: "04", label: "EXPERIENCE", status: "LOG READY", description: "Professional engineering journey", path: "/experience" },
  { id: "achievements", index: "05", label: "ACHIEVEMENTS", status: "RECORDS READY", description: "Milestones and recognition", path: "/achievements" },
];

export const NAV_ITEMS = SYSTEM_NODES.map(({ label, path }) => ({ label, path }));