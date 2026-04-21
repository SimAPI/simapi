import { faker } from "simapi";

export interface Tag {
  id: string;
  slug: string;
  name: string;
  postCount: number;
}

const PREDEFINED_TAGS = [
  { slug: "react", name: "React" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "api", name: "API" },
  { slug: "design", name: "Design" },
  { slug: "css", name: "CSS" },
  { slug: "node", name: "Node.js" },
  { slug: "devtools", name: "DevTools" },
  { slug: "dx", name: "Developer Experience" },
  { slug: "ux", name: "UX" },
  { slug: "open-source", name: "Open Source" },
  { slug: "performance", name: "Performance" },
  { slug: "testing", name: "Testing" },
  { slug: "ci-cd", name: "CI/CD" },
  { slug: "accessibility", name: "Accessibility" },
  { slug: "ai", name: "AI" },
];

export function allTags(): Tag[] {
  return PREDEFINED_TAGS.map((t) => ({
    id: faker.string.ulid(),
    ...t,
    postCount: faker.number.int({ min: 2, max: 40 }),
  }));
}

export function makeTag(): Tag {
  const base = faker.helpers.arrayElement(PREDEFINED_TAGS);
  return {
    id: faker.string.ulid(),
    ...base,
    postCount: faker.number.int({ min: 2, max: 40 }),
  };
}
