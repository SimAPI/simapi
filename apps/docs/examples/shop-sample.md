# Shop API Example

A complete e-commerce backend simulator covering product catalog, cart management, order processing, reviews, and customer accounts.

**Live demo:** [simapi-shop-sample.mayrlabs.com/__simapi/console/](https://simapi-shop-sample.mayrlabs.com/__simapi/console/)

**Source:** [`examples/shop-sample`](https://github.com/SimAPI/simapi/tree/main/examples/shop-sample)

## Running locally

```bash
cd examples/shop-sample
npm install
npm run serve
# → http://localhost:3002
# → http://localhost:3002/__simapi/console
```

## Configuration

```ts
// simapi.config.ts
export default defineConfig({
  port: 3002,
  name: "Shop API",
  authHandler: AuthHandlers.bearer(),
  autoThrowValidationErrors: "laravel",
  database: { type: "sqlite", path: ".data/shop.db" },
});
```

Register a customer account via `POST /api/auth/register`, then sign in at `POST /api/auth/login`. Include the returned token as `Authorization: Bearer <token>` on protected routes.
## Endpoints
### Auth
| Method | Path                 | Auth | Description                    |
| ------ | -------------------- | ---- | ------------------------------ |
| `POST` | `/api/auth/register` | —    | Create customer account        |
| `POST` | `/api/auth/login`    | —    | Sign in, returns access token  |
| `GET`  | `/api/auth/me`       | ✓    | Authenticated customer profile |
| `PUT`  | `/api/auth/me`       | ✓    | Update profile                 |
### Products
| Method   | Path                   | Auth | Description                                                                    |
| -------- | ---------------------- | ---- | ------------------------------------------------------------------------------ |
| `GET`    | `/api/products`        | —    | Paginated catalog (filter by `category`, `min_price`, `max_price`, `in_stock`) |
| `GET`    | `/api/products/search` | —    | Search products by `q`                                                         |
| `GET`    | `/api/products/:id`    | —    | Product detail with variants and reviews                                       |
| `POST`   | `/api/products`        | ✓    | Create product                                                                 |
| `PUT`    | `/api/products/:id`    | ✓    | Update product                                                                 |
| `DELETE` | `/api/products/:id`    | ✓    | Delete product                                                                 |
### Categories
| Method | Path                             | Auth | Description            |
| ------ | -------------------------------- | ---- | ---------------------- |
| `GET`  | `/api/categories`                | —    | All categories         |
| `GET`  | `/api/categories/:slug/products` | —    | Products in a category |

### Cart

| Method   | Path                     | Auth | Description                             |
| -------- | ------------------------ | ---- | --------------------------------------- |
| `GET`    | `/cart`                  | ✓    | Current cart with line items and totals |
| `POST`   | `/cart/items`            | ✓    | Add item to cart                        |
| `PUT`    | `/cart/items/:productId` | ✓    | Update item quantity                    |
| `DELETE` | `/cart/items/:productId` | ✓    | Remove item from cart                   |
| `DELETE` | `/cart`                  | ✓    | Clear entire cart                       |

### Orders

| Method | Path                 | Auth | Description                   |
| ------ | -------------------- | ---- | ----------------------------- |
| `GET`  | `/orders`            | ✓    | Order history                 |
| `GET`  | `/orders/:id`        | ✓    | Order detail with line items  |
| `POST` | `/orders`            | ✓    | Place order from current cart |
| `POST` | `/orders/:id/cancel` | ✓    | Cancel pending order          |

### Reviews

| Method | Path                    | Auth | Description                      |
| ------ | ----------------------- | ---- | -------------------------------- |
| `GET`  | `/products/:id/reviews` | —    | Reviews for a product            |
| `POST` | `/products/:id/reviews` | ✓    | Submit review (rating + comment) |

## Models

### Product

```ts
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  status: "active" | "draft" | "archived";
  inStock: boolean;
  stockCount: number;
  images: string[];
  variants: ProductVariant[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: number;
  inStock: boolean;
}
```

### Order

```ts
interface Order {
  id: number;
  customerId: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}
```
