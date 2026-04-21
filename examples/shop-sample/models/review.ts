import { faker } from "simapi";

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpfulCount: number;
  images: string[];
  createdAt: string;
}

export function makeReview(productId = faker.string.ulid()): Review {
  const rating = faker.helpers.weightedArrayElement([
    { value: 5, weight: 40 },
    { value: 4, weight: 30 },
    { value: 3, weight: 15 },
    { value: 2, weight: 10 },
    { value: 1, weight: 5 },
  ]);
  const name = faker.person.fullName();
  const hasImages = faker.datatype.boolean({ probability: 0.25 });
  return {
    id: faker.string.ulid(),
    productId,
    customerId: faker.string.ulid(),
    customerName: name,
    customerAvatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${faker.string.alphanumeric(8)}`,
    rating,
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    body: faker.lorem.sentences({ min: 2, max: 5 }),
    verified: faker.datatype.boolean({ probability: 0.8 }),
    helpfulCount: faker.number.int({ min: 0, max: 60 }),
    images: hasImages
      ? Array.from(
          { length: faker.number.int({ min: 1, max: 3 }) },
          () =>
            `https://picsum.photos/seed/${faker.string.alphanumeric(6)}/400/400`
        )
      : [],
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
  };
}
