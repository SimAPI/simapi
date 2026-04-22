import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  faker,
  z,
} from "@simapi/simapi";
import { makeReview } from "@/models/review.js";

export const listReviews: EndpointDefinition = {
  path: "/api/products/:id/reviews",
  method: "GET",
  type: "open",
  title: "List Reviews",
  description: "Returns reviews for a product sorted by most helpful.",
  delay: 100,
  handler: (req: AppRequest) => {
    const productId = req.urlParam("id") ?? faker.string.ulid();
    const reviews = AppResponse.array(10, () => makeReview(productId));
    const avgRating =
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return AppResponse.success({
      data: reviews,
      summary: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: faker.number.int({ min: 10, max: 400 }),
        distribution: { 5: 40, 4: 30, 3: 15, 2: 10, 1: 5 },
      },
    });
  },
};

export const addReview: EndpointDefinition = {
  path: "/api/products/:id/reviews",
  method: "POST",
  type: "secure",
  title: "Add Review",
  description: "Submit a review for a product you have purchased.",
  validator: {
    rating: z.number().int().min(1).max(5),
    title: z.string().min(3).max(120),
    body: z.string().min(10).max(2000),
  },
  handler: (req: AppRequest) =>
    AppResponse.created({
      data: {
        ...makeReview(req.urlParam("id")),
        rating: req.body<number>("rating"),
        title: req.body<string>("title"),
        body: req.body<string>("body"),
        verified: true,
      },
    }),
};
