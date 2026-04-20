import { faker } from "simapi";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  joinedAt: string;
}

export function makeUser(): User {
  return {
    id: faker.string.ulid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(["admin", "member"] as const),
    joinedAt: faker.date.past().toISOString(),
  };
}
