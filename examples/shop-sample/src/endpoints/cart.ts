import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  faker,
  z,
} from "@simapi/simapi";
import { makeProduct } from "@/models/product.js";

function makeCartItem() {
  const product = makeProduct();
  const qty = faker.number.int({ min: 1, max: 3 });
  return {
    id: faker.string.ulid(),
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      thumbnailUrl: product.thumbnailUrl,
      sku: product.sku,
    },
    quantity: qty,
    lineTotal: product.price * qty,
  };
}

export const getCart: EndpointDefinition = {
  path: "/api/cart",
  method: "GET",
  type: "secure",
  title: "Get Cart",
  description: "Returns the current customer's shopping cart.",
  handler: () => {
    const items = AppResponse.array(
      faker.number.int({ min: 0, max: 5 }),
      makeCartItem
    );
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    return AppResponse.success({
      data: {
        id: faker.string.ulid(),
        items,
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
        subtotal,
        currency: "USD",
      },
    });
  },
};

export const addToCart: EndpointDefinition = {
  path: "/api/cart/items",
  method: "POST",
  type: "secure",
  title: "Add to Cart",
  description:
    "Adds a product to the cart. If the product is already in the cart the quantity is incremented.",
  request: {
    body: {
      productId: z.string(),
      quantity: z.number().int().min(1).max(99),
      variantId: z.string().optional(),
    },
  },
  handler: () => AppResponse.created({ data: makeCartItem() }),
};

export const updateCartItem: EndpointDefinition = {
  path: "/api/cart/items/:id",
  method: "PUT",
  type: "secure",
  title: "Update Cart Item",
  description:
    "Change the quantity of a cart line. Set quantity to 0 to remove the item.",
  request: {
    body: {
      quantity: z.number().int().min(0).max(99),
    },
  },
  handler: (req: AppRequest) =>
    AppResponse.success({
      data: {
        ...makeCartItem(),
        id: req.urlParam("id"),
        quantity: req.body<number>("quantity") ?? 1,
      },
    }),
};

export const removeCartItem: EndpointDefinition = {
  path: "/api/cart/items/:id",
  method: "DELETE",
  type: "secure",
  title: "Remove Cart Item",
  description: "Removes a specific line item from the cart.",
  handler: () => AppResponse.noContent(),
};

export const clearCart: EndpointDefinition = {
  path: "/api/cart",
  method: "DELETE",
  type: "secure",
  title: "Clear Cart",
  description: "Removes all items from the cart.",
  handler: () => AppResponse.noContent(),
};
