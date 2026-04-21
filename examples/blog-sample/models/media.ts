import { faker } from "simapi";

export type MediaType = "image" | "video" | "document";

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  uploadedBy: string;
  createdAt: string;
}

export function makeMedia(type: MediaType = "image"): MediaItem {
  const seed = faker.string.alphanumeric(8);
  const w = faker.helpers.arrayElement([800, 1200, 1600, 2400]);
  const h = Math.round(w * faker.number.float({ min: 0.5, max: 1.2 }));
  return {
    id: faker.string.ulid(),
    filename: `${seed}.${type === "image" ? "jpg" : type === "video" ? "mp4" : "pdf"}`,
    originalName: `${faker.lorem.words(3).replace(/ /g, "-")}.${type === "image" ? "jpg" : type === "video" ? "mp4" : "pdf"}`,
    mimeType:
      type === "image"
        ? "image/jpeg"
        : type === "video"
          ? "video/mp4"
          : "application/pdf",
    size: faker.number.int({ min: 10000, max: 5000000 }),
    type,
    url:
      type === "image"
        ? `https://picsum.photos/seed/${seed}/${w}/${h}`
        : `https://cdn.example.com/media/${seed}`,
    thumbnailUrl:
      type === "image" ? `https://picsum.photos/seed/${seed}/400/300` : null,
    width: type === "image" ? w : null,
    height: type === "image" ? h : null,
    uploadedBy: faker.person.fullName(),
    createdAt: faker.date.recent({ days: 60 }).toISOString(),
  };
}
