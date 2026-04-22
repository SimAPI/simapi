import { faker } from "@simapi/simapi";

export interface Author {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  role: "admin" | "editor" | "contributor";
  website: string | null;
  twitter: string | null;
  postCount: number;
  totalViews: number;
  joinedAt: string;
}

export function makeAuthor(): Author {
  const name = faker.person.fullName();
  const handle = faker.internet.username({ firstName: name.split(" ")[0] });
  return {
    id: faker.string.ulid(),
    name,
    email: faker.internet.email(),
    bio: faker.lorem.sentences(2),
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${handle}`,
    role: faker.helpers.weightedArrayElement([
      { value: "admin" as const, weight: 1 },
      { value: "editor" as const, weight: 3 },
      { value: "contributor" as const, weight: 6 },
    ]),
    website: faker.datatype.boolean({ probability: 0.6 })
      ? faker.internet.url()
      : null,
    twitter: faker.datatype.boolean({ probability: 0.7 }) ? `@${handle}` : null,
    postCount: faker.number.int({ min: 1, max: 80 }),
    totalViews: faker.number.int({ min: 500, max: 500000 }),
    joinedAt: faker.date.past({ years: 3 }).toISOString(),
  };
}
