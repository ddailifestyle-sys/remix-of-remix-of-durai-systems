export interface SystemNode {
  id: string;
  index: string;
  label: string;
  status: string;
  description: string;
  path: "/profile" | "/skills" | "/projects" | "/experience" | "/achievements";
}

export interface BootCheck {
  label: string;
  value: string;
}