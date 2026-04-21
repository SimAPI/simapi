import { faker } from "simapi";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  totalOrders: number;
  totalSpent: number;
  addresses: {
    id: string;
    label: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }[];
  createdAt: string;
}

export function makeCustomer(): Customer {
  const name = faker.person.fullName();
  const spent = faker.number.int({ min: 0, max: 5000 });
  return {
    id: faker.string.ulid(),
    name,
    email: faker.internet.email(),
    phone: faker.datatype.boolean({ probability: 0.6 })
      ? faker.phone.number()
      : null,
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${faker.string.alphanumeric(8)}`,
    tier:
      spent > 2000
        ? "platinum"
        : spent > 1000
          ? "gold"
          : spent > 300
            ? "silver"
            : "bronze",
    totalOrders: faker.number.int({ min: 0, max: 50 }),
    totalSpent: spent,
    addresses: [
      {
        id: faker.string.ulid(),
        label: "Home",
        line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        postalCode: faker.location.zipCode(),
        country: "US",
        isDefault: true,
      },
    ],
    createdAt: faker.date.past({ years: 2 }).toISOString(),
  };
}
