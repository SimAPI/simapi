import { faker } from "simapi";

export type ProductStatus =
  | "active"
  | "draft"
  | "out_of_stock"
  | "discontinued";

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  thumbnailUrl: string;
  status: ProductStatus;
  inventory: number;
  sku: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { id: "cat_01", name: "Electronics" },
  { id: "cat_02", name: "Clothing" },
  { id: "cat_03", name: "Books" },
  { id: "cat_04", name: "Home & Garden" },
  { id: "cat_05", name: "Sports" },
];

export function makeProduct(): Product {
  const name = faker.commerce.productName();
  const price = Number(faker.commerce.price({ min: 5, max: 500 }));
  const hasDiscount = faker.datatype.boolean({ probability: 0.4 });
  const cat = faker.helpers.arrayElement(CATEGORIES);
  const seed = faker.string.alphanumeric(6);
  return {
    id: faker.string.ulid(),
    slug: faker.helpers.slugify(name.toLowerCase()),
    name,
    description: faker.commerce.productDescription(),
    shortDescription: faker.lorem.sentence(),
    categoryId: cat.id,
    categoryName: cat.name,
    price,
    compareAtPrice: hasDiscount ? Math.round(price * 1.3) : null,
    currency: "USD",
    images: Array.from(
      { length: faker.number.int({ min: 2, max: 5 }) },
      (_, i) => `https://picsum.photos/seed/${seed}${i}/800/800`
    ),
    thumbnailUrl: `https://picsum.photos/seed/${seed}/400/400`,
    status: faker.helpers.weightedArrayElement([
      { value: "active" as const, weight: 8 },
      { value: "draft" as const, weight: 1 },
      { value: "out_of_stock" as const, weight: 1 },
    ]),
    inventory: faker.number.int({ min: 0, max: 500 }),
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    tags: faker.helpers.arrayElements(
      ["sale", "new", "popular", "featured", "eco", "premium"],
      { min: 0, max: 3 }
    ),
    rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 0, max: 400 }),
    soldCount: faker.number.int({ min: 0, max: 5000 }),
    variants: [],
    createdAt: faker.date.recent({ days: 120 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  };
}
