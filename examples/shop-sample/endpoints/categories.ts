import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
} from "@simapi/simapi";
import { allCategories } from "../models/category.js";
import { makeProduct } from "../models/product.js";

export const listCategories: EndpointDefinition = {
  path: "/api/categories",
  method: "GET",
  type: "open",
  title: "List Categories",
  description: "Returns all product categories.",
  handler: () => AppResponse.success({ data: allCategories() }),
};

export const getCategoryProducts: EndpointDefinition = {
  path: "/api/categories/:id/products",
  method: "GET",
  type: "open",
  title: "Products by Category",
  description: "Returns paginated products for a specific category.",
  delay: 150,
  handler: (req: AppRequest) => {
    const page = Number(req.param("page") ?? "1");
    return AppResponse.success({
      data: AppResponse.array(16, makeProduct),
      meta: { categoryId: req.urlParam("id"), total: 64, page, perPage: 16 },
    });
  },
};
