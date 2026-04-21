import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "@simapi/simapi";
import { makeOrder } from "../models/order.js";

export const listOrders: EndpointDefinition = {
  path: "/api/orders",
  method: "GET",
  type: "secure",
  title: "List Orders",
  description:
    "Returns the authenticated customer's order history, newest first.",
  delay: 150,
  handler: (req: AppRequest) => {
    const page = Number(req.param("page") ?? "1");
    return AppResponse.success({
      data: AppResponse.array(10, makeOrder),
      meta: { total: 28, page, perPage: 10 },
    });
  },
};

export const getOrder: EndpointDefinition = {
  path: "/api/orders/:id",
  method: "GET",
  type: "secure",
  title: "Get Order",
  description:
    "Returns full details for a specific order including line items and shipping.",
  delay: 100,
  handler: (req: AppRequest) =>
    AppResponse.success({ data: { ...makeOrder(), id: req.urlParam("id") } }),
};

export const placeOrder: EndpointDefinition = {
  path: "/api/orders",
  method: "POST",
  type: "secure",
  title: "Place Order",
  description:
    "Converts the current cart into a new order and charges the payment method.",
  validator: {
    addressId: z.string(),
    paymentMethodId: z.string(),
    notes: z.string().max(500).optional(),
    couponCode: z.string().optional(),
  },
  delay: 800,
  failRate: 0.05,
  handler: () =>
    AppResponse.created({
      data: { ...makeOrder(), status: "processing", paymentStatus: "paid" },
      message: "Order placed successfully.",
    }),
};

export const cancelOrder: EndpointDefinition = {
  path: "/api/orders/:id/cancel",
  method: "PUT",
  type: "secure",
  title: "Cancel Order",
  description:
    "Cancels an order that has not yet shipped. Initiates a refund if payment was taken.",
  handler: (req: AppRequest) =>
    AppResponse.success({
      data: { ...makeOrder(), id: req.urlParam("id"), status: "cancelled" },
    }),
};
