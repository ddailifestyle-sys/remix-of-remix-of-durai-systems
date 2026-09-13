export type SkillCategoryId =
  | "languages"
  | "backend"
  | "frontend"
  | "databases"
  | "cloudDevOps"
  | "iotEmbedded"
  | "tools";

export interface Skill {
  id: string;
  name: string;
  /** General, non-proficiency descriptor, e.g. "WEB FRAMEWORK". */
  type: string;
  category: SkillCategoryId;
}

export interface SkillCategory {
  id: SkillCategoryId;
  label: string;
  shortLabel: string;
  relatedSystem: string;
  /** Angle in degrees around the engineering core for the desktop network. */
  angle: number;
  skills: Skill[];
}

export interface SkillRelationship {
  label: string;
  chain: string[];
}
