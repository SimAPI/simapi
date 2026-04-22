import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  z,
} from "@simapi/simapi";
import { makeProduct } from "@/models/product.js";

export const listProducts: EndpointDefinition = {
  path: "/api/products",
  method: "GET",
  type: "open",
  title: "List Products",
  description:
    "Returns paginated products. Filter by category, tag, min/max price and status.",
  delay: 150,
  handler: (req: AppRequest) => {
    const page = Number(req.param("page") ?? "1");
    const perPage = Number(req.param("perPage") ?? "20");
    return AppResponse.success({
      data: AppResponse.array(perPage, makeProduct),
      meta: {
        total: 432,
        page,
        perPage,
        lastPage: Math.ceil(432 / perPage),
        filters: {
          category: req.param("category") ?? null,
          minPrice: req.param("minPrice") ?? null,
          maxPrice: req.param("maxPrice") ?? null,
          sort: req.param("sort") ?? "newest",
        },
      },
    });
  },
};

export const searchProducts: EndpointDefinition = {
  path: "/api/products/search",
  method: "GET",
  type: "open",
  title: "Search Products",
  description: "Full-text search across product names and descriptions.",
  delay: 200,
  handler: (req: AppRequest) => {
    const q = req.param("q") ?? "";
    return AppResponse.success({
      data: q ? AppResponse.array(8, makeProduct) : [],
      meta: { query: q, total: q ? 8 : 0 },
    });
  },
};

export const getProduct: EndpointDefinition = {
  path: "/api/products/:id",
  method: "GET",
  type: "open",
  title: "Get Product",
  description: "Returns full product details including variants and images.",
  delay: 100,
  failRate: 0.05,
  handler: (req: AppRequest) =>
    AppResponse.success({ data: { ...makeProduct(), id: req.urlParam("id") } }),
};

export const createProduct: EndpointDefinition = {
  path: "/api/products",
  method: "POST",
  type: "secure",
  title: "Create Product",
  description: "Creates a new product as a draft.",
  validator: {
    name: z.string().min(3).max(200),
    description: z.string().min(10),
    price: z.number().positive(),
    categoryId: z.string(),
    sku: z.string().min(4),
    inventory: z.number().int().min(0),
  },
  handler: (req: AppRequest) =>
    AppResponse.created({
      data: {
        ...makeProduct(),
        name: req.body<string>("name"),
        status: "draft",
      },
    }),
};

export const updateProduct: EndpointDefinition = {
  path: "/api/products/:id",
  method: "PUT",
  type: "secure",
  title: "Update Product",
  description: "Update product details, pricing or inventory.",
  validator: {
    name: z.string().min(3).max(200).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    inventory: z.number().int().min(0).optional(),
    status: z.enum(["active", "draft", "out_of_stock"]).optional(),
  },
  handler: (req: AppRequest) =>
    AppResponse.success({ data: { ...makeProduct(), id: req.urlParam("id") } }),
};

export const deleteProduct: EndpointDefinition = {
  path: "/api/products/:id",
  method: "DELETE",
  type: "secure",
  title: "Delete Product",
  description: "Permanently deletes a product.",
  handler: () => AppResponse.noContent(),
};
