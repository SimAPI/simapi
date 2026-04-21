import { faker } from "simapi";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  postCount: number;
}

const PREDEFINED: Omit<Category, "id" | "postCount">[] = [
  {
    slug: "technology",
    name: "Technology",
    description: "The latest in tech, tools, and platforms.",
    color: "#3B82F6",
  },
  {
    slug: "design",
    name: "Design",
    description: "UI/UX, visual design and product thinking.",
    color: "#8B5CF6",
  },
  {
    slug: "product",
    name: "Product",
    description: "Product strategy, roadmaps and user research.",
    color: "#10B981",
  },
  {
    slug: "engineering",
    name: "Engineering",
    description: "Architecture, patterns and engineering culture.",
    color: "#F59E0B",
  },
  {
    slug: "culture",
    name: "Culture",
    description: "Remote work, team building and company culture.",
    color: "#EC4899",
  },
  {
    slug: "news",
    name: "News",
    description: "Company updates and announcements.",
    color: "#6B7280",
  },
];

export function makeCategory(index?: number): Category {
  const base =
    index !== undefined
      ? PREDEFINED[index % PREDEFINED.length]
      : faker.helpers.arrayElement(PREDEFINED);
  return {
    id: faker.string.ulid(),
    ...base,
    postCount: faker.number.int({ min: 5, max: 60 }),
  };
}

export function allCategories(): Category[] {
  return PREDEFINED.map((p) => ({
    id: faker.string.ulid(),
    ...p,
    postCount: faker.number.int({ min: 5, max: 60 }),
  }));
}
