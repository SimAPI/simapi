import { faker } from "simapi";

export type CommentStatus = "pending" | "approved" | "rejected";

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  body: string;
  status: CommentStatus;
  likeCount: number;
  replyCount: number;
  createdAt: string;
}

export function makeComment(
  postId = faker.string.ulid(),
  status: CommentStatus = "approved"
): Comment {
  return {
    id: faker.string.ulid(),
    postId,
    parentId: null,
    authorName: faker.person.fullName(),
    authorEmail: faker.internet.email(),
    authorAvatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${faker.string.alphanumeric(8)}`,
    body: faker.lorem.sentences({ min: 1, max: 4 }),
    status,
    likeCount: faker.number.int({ min: 0, max: 50 }),
    replyCount: faker.number.int({ min: 0, max: 12 }),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
  };
}
