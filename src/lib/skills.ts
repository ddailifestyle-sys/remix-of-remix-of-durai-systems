import type { Skill, SkillCategory, SkillCategoryId, SkillRelationship } from "../types/skills";

function build(category: SkillCategoryId, entries: [string, string][]): Skill[] {
  return entries.map(([name, type]) => ({
    id: `${category}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    type,
    category,
  }));
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "languages",
    label: "PROGRAMMING LANGUAGES",
    shortLabel: "PROGRAMMING",
    relatedSystem: "ENGINEERING FOUNDATION",
    angle: -90,
    skills: build("languages", [
      ["Python", "PROGRAMMING LANGUAGE"],
      ["Java", "PROGRAMMING LANGUAGE"],
      ["C++", "PROGRAMMING LANGUAGE"],
      ["JavaScript", "PROGRAMMING LANGUAGE"],
      ["TypeScript", "PROGRAMMING LANGUAGE"],
      ["SQL", "QUERY LANGUAGE"],
    ]),
  },
  {
    id: "backend",
    label: "BACKEND",
    shortLabel: "BACKEND",
    relatedSystem: "BACKEND ENGINEERING",
    angle: -38,
    skills: build("backend", [
      ["Node.js", "RUNTIME"],
      ["Express.js", "WEB FRAMEWORK"],
      ["FastAPI", "WEB FRAMEWORK"],
      ["REST APIs", "API ARCHITECTURE"],
      ["WebSockets", "REALTIME PROTOCOL"],
    ]),
  },
  {
    id: "frontend",
    label: "FRONTEND",
    shortLabel: "FRONTEND",
    relatedSystem: "INTERFACE ENGINEERING",
    angle: 14,
    skills: build("frontend", [
      ["React.js", "UI LIBRARY"],
      ["Next.js", "WEB FRAMEWORK"],
      ["TypeScript", "PROGRAMMING LANGUAGE"],
      ["Tailwind CSS", "STYLING FRAMEWORK"],
      ["HTML", "MARKUP LANGUAGE"],
      ["CSS", "STYLING LANGUAGE"],
    ]),
  },
  {
    id: "databases",
    label: "DATABASE",
    shortLabel: "DATABASE",
    relatedSystem: "DATA ENGINEERING",
    angle: 66,
    skills: build("databases", [
      ["PostgreSQL", "RELATIONAL DATABASE"],
      ["MongoDB", "DOCUMENT DATABASE"],
      ["Redis", "IN-MEMORY STORE"],
      ["Supabase", "BACKEND PLATFORM"],
      ["Firebase Firestore", "DOCUMENT DATABASE"],
    ]),
  },
  {
    id: "cloudDevOps",
    label: "CLOUD & DEVOPS",
    shortLabel: "CLOUD",
    relatedSystem: "CLOUD ENGINEERING",
    angle: 118,
    skills: build("cloudDevOps", [
      ["AWS EC2", "CLOUD COMPUTE"],
      ["S3", "OBJECT STORAGE"],
      ["Lambda", "SERVERLESS COMPUTE"],
      ["IoT Core", "CLOUD IoT SERVICE"],
      ["RDS", "MANAGED DATABASE"],
      ["CloudWatch", "MONITORING"],
      ["Docker", "CONTAINERISATION"],
      ["GitHub Actions", "AUTOMATION"],
      ["CI/CD", "DELIVERY PRACTICE"],
      ["Nginx", "WEB SERVER"],
    ]),
  },
  {
    id: "iotEmbedded",
    label: "IoT & EMBEDDED",
    shortLabel: "IoT",
    relatedSystem: "IoT SYSTEMS ENGINEERING",
    angle: 170,
    skills: build("iotEmbedded", [
      ["ESP32", "MICROCONTROLLER"],
      ["ESP8266", "MICROCONTROLLER"],
      ["MQTT", "MESSAGING PROTOCOL"],
      ["Sensors", "HARDWARE"],
      ["Telemetry", "DATA CONCEPT"],
      ["Edge Computing", "ARCHITECTURE"],
      ["Embedded C", "PROGRAMMING LANGUAGE"],
    ]),
  },
  {
    id: "tools",
    label: "TOOLS & PLATFORMS",
    shortLabel: "TOOLS",
    relatedSystem: "ENGINEERING WORKFLOW",
    angle: 222,
    skills: build("tools", [
      ["VS Code", "EDITOR"],
      ["Git", "VERSION CONTROL"],
      ["Postman", "API TOOL"],
      ["Figma", "DESIGN TOOL"],
      ["Linux", "OPERATING SYSTEM"],
      ["Swagger", "API DOCUMENTATION"],
      ["n8n", "AUTOMATION PLATFORM"],
      ["OpenAI APIs", "AI SERVICE"],
    ]),
  },
];

export const ALL_SKILLS: Skill[] = SKILL_CATEGORIES.flatMap((c) => c.skills);

export const SKILL_RELATIONSHIPS: SkillRelationship[] = [
  {
    label: "CONCEPTUAL IoT DATA PATH",
    chain: ["ESP32", "MQTT", "CLOUD", "DATABASE", "DASHBOARD"],
  },
];

export function findCategory(id: SkillCategoryId): SkillCategory | undefined {
  return SKILL_CATEGORIES.find((c) => c.id === id);
}
