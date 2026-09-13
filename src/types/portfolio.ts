export type SystemPath =
  | "/profile"
  | "/skills"
  | "/projects"
  | "/experience"
  | "/achievements"
  | "/education"
  | "/certifications"
  | "/resume"
  | "/contact";

export interface SystemNode {
  id: string;
  index: string;
  label: string;
  status: string;
  descriptor: string;
  description: string;
  path: SystemPath;
  /** Position in the desktop command-center composition, percent of stage. */
  x: number;
  y: number;
}

export interface BootCheck {
  label: string;
  value: string;
}

export interface FocusArea {
  id: string;
  index: string;
  label: string;
  description: string;
}

export interface ContactLink {
  id: string;
  label: string;
  value: string;
  href: string;
  external: boolean;
}

export interface ProfileData {
  name: string;
  roles: string[];
  positioning: string;
  about: string[];
  summary: string[];
  location: string;
  status: { label: string; value: string }[];
  focusAreas: FocusArea[];
  contact: ContactLink[];
}
