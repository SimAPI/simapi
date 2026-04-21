import { faker } from "simapi";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  parentId: string | null;
}

const PREDEFINED = [
  {
    id: "cat_01",
    slug: "electronics",
    name: "Electronics",
    description: "Gadgets, devices, and accessories.",
    parentId: null,
  },
  {
    id: "cat_02",
    slug: "clothing",
    name: "Clothing",
    description: "Fashion for every style and occasion.",
    parentId: null,
  },
  {
    id: "cat_03",
    slug: "books",
    name: "Books",
    description: "Fiction, non-fiction, textbooks and more.",
    parentId: null,
  },
  {
    id: "cat_04",
    slug: "home-garden",
    name: "Home & Garden",
    description: "Everything for your living space.",
    parentId: null,
  },
  {
    id: "cat_05",
    slug: "sports",
    name: "Sports & Outdoors",
    description: "Gear and equipment for an active lifestyle.",
    parentId: null,
  },
];

export function allCategories(): Category[] {
  return PREDEFINED.map((p) => ({
    ...p,
    image: `https://picsum.photos/seed/${p.slug}/600/400`,
    productCount: faker.number.int({ min: 20, max: 200 }),
  }));
}
