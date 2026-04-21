# Blog API Example

A full-featured blog backend simulator covering authentication, content management, comments, authors, media uploads, and analytics.

**Live demo:** [simapi-blog-sample.mayrlabs.com/__simapi/console/](https://simapi-blog-sample.mayrlabs.com/__simapi/console/)

**Source:** [`examples/blog-sample`](https://github.com/SimAPI/simapi/tree/main/examples/blog-sample)

## Running locally

```bash
cd examples/blog-sample
npm install
npm run serve
# → http://localhost:3001
# → http://localhost:3001/__simapi/console
```

## Configuration

```ts
// simapi.config.ts
export default defineConfig({
  port: 3001,
  name: "Blog API",
  authHandler: AuthHandlers.bearer(),
  autoThrowValidationErrors: "laravel",
  database: { type: "sqlite", path: ".data/blog.db" },
});
```

Bearer token authentication is pre-configured. Log in via `POST /auth/login` and include the returned token as `Authorization: Bearer <token>` on protected routes.

## Endpoints

### Auth

| Method | Path            | Auth | Description                   |
| ------ | --------------- | ---- | ----------------------------- |
| `POST` | `/auth/login`   | —    | Sign in, returns access token |
| `POST` | `/auth/logout`  | ✓    | Invalidate current token      |
| `POST` | `/auth/refresh` | ✓    | Exchange refresh token        |
| `GET`  | `/auth/me`      | ✓    | Authenticated user profile    |

### Posts

| Method   | Path                 | Auth | Description                                                 |
| -------- | -------------------- | ---- | ----------------------------------------------------------- |
| `GET`    | `/posts`             | —    | Paginated post list (filter by `status`, `category`, `tag`) |
| `GET`    | `/posts/featured`    | —    | Featured posts                                              |
| `GET`    | `/posts/search`      | —    | Full-text search (`q` query param)                          |
| `GET`    | `/posts/:id`         | —    | Single post with author & tags                              |
| `POST`   | `/posts`             | ✓    | Create draft post                                           |
| `PUT`    | `/posts/:id`         | ✓    | Update post                                                 |
| `POST`   | `/posts/:id/publish` | ✓    | Publish draft                                               |
| `POST`   | `/posts/:id/archive` | ✓    | Archive post                                                |
| `DELETE` | `/posts/:id`         | ✓    | Delete post                                                 |

### Comments

| Method   | Path                    | Auth | Description                         |
| -------- | ----------------------- | ---- | ----------------------------------- |
| `GET`    | `/posts/:id/comments`   | —    | Approved comments for a post        |
| `POST`   | `/posts/:id/comments`   | —    | Submit comment (pending moderation) |
| `GET`    | `/comments/pending`     | ✓    | All pending comments                |
| `POST`   | `/comments/:id/approve` | ✓    | Approve comment                     |
| `POST`   | `/comments/:id/reject`  | ✓    | Reject comment                      |
| `DELETE` | `/comments/:id`         | ✓    | Delete comment                      |

### Authors

| Method | Path           | Auth | Description                    |
| ------ | -------------- | ---- | ------------------------------ |
| `GET`  | `/authors`     | —    | All authors                    |
| `GET`  | `/authors/:id` | —    | Author profile with post count |
| `PUT`  | `/authors/me`  | ✓    | Update own profile             |

### Categories & Tags

| Method | Path                | Auth | Description                     |
| ------ | ------------------- | ---- | ------------------------------- |
| `GET`  | `/categories`       | —    | All categories with post counts |
| `GET`  | `/categories/:slug` | —    | Category detail                 |
| `GET`  | `/tags`             | —    | All tags                        |
| `GET`  | `/tags/:slug/posts` | —    | Posts by tag                    |

### Media

| Method   | Path         | Auth | Description                      |
| -------- | ------------ | ---- | -------------------------------- |
| `GET`    | `/media`     | ✓    | Media library (filter by `type`) |
| `POST`   | `/media`     | ✓    | Upload media item                |
| `DELETE` | `/media/:id` | ✓    | Delete media item                |

### Analytics

| Method | Path                   | Auth | Description                              |
| ------ | ---------------------- | ---- | ---------------------------------------- |
| `GET`  | `/analytics/overview`  | ✓    | Site-wide stats (views, posts, comments) |
| `GET`  | `/analytics/posts/:id` | ✓    | Per-post view and engagement stats       |

## Models

### Post

```ts
interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "archived";
  author: Author;
  category: string;
  tags: string[];
  coverImage: string;
  viewCount: number;
  commentCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Comment

```ts
interface Comment {
  id: number;
  postId: number;
  authorName: string;
  authorEmail: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
```
