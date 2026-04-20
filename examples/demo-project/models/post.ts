import { faker } from "simapi";

export interface Post {
  id: string;
  title: string;
  body: string;
  published: boolean;
  author: string;
  createdAt: string;
}

export function makePost(): Post {
  return {
    id: faker.string.ulid(),
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    published: faker.datatype.boolean(),
    author: faker.person.fullName(),
    createdAt: faker.date.recent().toISOString(),
  };
}
