export type ProjectCategoryId = "full-stack" | "ai-healthcare" | "event" | "iot" | "erp";

export interface ProjectCategory {
  id: ProjectCategoryId | "all";
  label: string;
}

export type ProjectVisualization = "fullstack" | "ai" | "event" | "iot" | "erp";

export interface ProjectLink {
  label: string;
  href: string;
  external: boolean;
}

export interface Project {
  id: string;
  number: string;
  name: string;
  category: string;
  categoryId: ProjectCategoryId;
  description: string;
  liveUrl: string;
  liveLabel: string;
  status: "DEPLOYED";
  visualization: ProjectVisualization;
  /** Position on the desktop lab floor, percent of stage. */
  x: number;
  y: number;
}
