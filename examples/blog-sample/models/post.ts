import { faker } from "simapi";

export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  status: PostStatus;
  authorId: string;
  authorName: string;
  categorySlug: string;
  tags: string[];
  readTimeMinutes: number;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "technology",
  "design",
  "product",
  "engineering",
  "culture",
  "news",
];
const TAGS = [
  "react",
  "typescript",
  "api",
  "design",
  "css",
  "node",
  "devtools",
  "dx",
  "ux",
  "open-source",
];

export function makePost(status: PostStatus = "published"): Post {
  const title = faker.lorem.sentence({ min: 4, max: 10 });
  const words = title.split(" ").length;
  const published = status === "published";
  return {
    id: faker.string.ulid(),
    slug: faker.helpers.slugify(title.toLowerCase()),
    title,
    excerpt: faker.lorem.sentences(2),
    body: faker.lorem.paragraphs({ min: 4, max: 8 }, "\n\n"),
    coverImage: `https://picsum.photos/seed/${faker.string.alphanumeric(6)}/1200/630`,
    status,
    authorId: faker.string.ulid(),
    authorName: faker.person.fullName(),
    categorySlug: faker.helpers.arrayElement(CATEGORIES),
    tags: faker.helpers.arrayElements(TAGS, { min: 2, max: 5 }),
    readTimeMinutes: Math.ceil(words * 0.3),
    viewCount: faker.number.int({ min: 0, max: 50000 }),
    commentCount: faker.number.int({ min: 0, max: 120 }),
    likeCount: faker.number.int({ min: 0, max: 2000 }),
    featured: faker.datatype.boolean({ probability: 0.15 }),
    publishedAt: published
      ? faker.date.recent({ days: 60 }).toISOString()
      : null,
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  };
}
