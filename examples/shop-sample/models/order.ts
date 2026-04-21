import { faker } from "simapi";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

function makeOrderItem(): OrderItem {
  const unitPrice = Number(faker.commerce.price({ min: 5, max: 200 }));
  const qty = faker.number.int({ min: 1, max: 4 });
  const seed = faker.string.alphanumeric(6);
  return {
    id: faker.string.ulid(),
    productId: faker.string.ulid(),
    productName: faker.commerce.productName(),
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    quantity: qty,
    unitPrice,
    totalPrice: unitPrice * qty,
    imageUrl: `https://picsum.photos/seed/${seed}/200/200`,
  };
}

export function makeOrder(): Order {
  const items = Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    makeOrderItem
  );
  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const tax = Math.round(subtotal * 0.08);
  const shipping = faker.number.int({ min: 0, max: 15 });
  const discount = faker.datatype.boolean({ probability: 0.3 })
    ? faker.number.int({ min: 5, max: 30 })
    : 0;
  const status = faker.helpers.arrayElement<OrderStatus>([
    "pending",
    "processing",
    "shipped",
    "delivered",
  ]);
  return {
    id: faker.string.ulid(),
    orderNumber: `ORD-${faker.string.numeric(8)}`,
    customerId: faker.string.ulid(),
    status,
    paymentStatus: status === "pending" ? "pending" : "paid",
    items,
    subtotal,
    taxAmount: tax,
    shippingAmount: shipping,
    discountAmount: discount,
    total: subtotal + tax + shipping - discount,
    currency: "USD",
    shippingAddress: {
      name: faker.person.fullName(),
      line1: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postalCode: faker.location.zipCode(),
      country: "US",
    },
    notes: faker.datatype.boolean({ probability: 0.2 })
      ? faker.lorem.sentence()
      : null,
    createdAt: faker.date.recent({ days: 60 }).toISOString(),
    updatedAt: faker.date.recent({ days: 7 }).toISOString(),
    shippedAt: ["shipped", "delivered"].includes(status)
      ? faker.date.recent({ days: 14 }).toISOString()
      : null,
    deliveredAt:
      status === "delivered"
        ? faker.date.recent({ days: 7 }).toISOString()
        : null,
  };
}
