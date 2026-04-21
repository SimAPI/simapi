import {
  type AppRequest,
  AppResponse,
  type EndpointDefinition,
  faker,
} from "@simapi/simapi";

export const overview: EndpointDefinition = {
  path: "/api/analytics/overview",
  method: "GET",
  type: "secure",
  title: "Analytics Overview",
  description: "Returns high-level blog statistics for the last 30 days.",
  delay: 250,
  handler: () =>
    AppResponse.success({
      period: {
        from: faker.date.recent({ days: 30 }).toISOString(),
        to: new Date().toISOString(),
      },
      stats: {
        totalViews: faker.number.int({ min: 10000, max: 500000 }),
        uniqueVisitors: faker.number.int({ min: 5000, max: 200000 }),
        avgReadTime: `${faker.number.int({ min: 2, max: 8 })}m ${faker.number.int({ min: 0, max: 59 })}s`,
        bounceRate: faker.number.float({
          min: 0.2,
          max: 0.7,
          fractionDigits: 2,
        }),
        newSubscribers: faker.number.int({ min: 10, max: 400 }),
        totalComments: faker.number.int({ min: 20, max: 300 }),
      },
      topPosts: AppResponse.array(5, () => ({
        id: faker.string.ulid(),
        title: faker.lorem.sentence({ min: 4, max: 8 }),
        slug: faker.lorem.slug(4),
        views: faker.number.int({ min: 500, max: 20000 }),
        readTime: `${faker.number.int({ min: 2, max: 10 })}m`,
      })),
      viewsByDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000)
          .toISOString()
          .split("T")[0],
        views: faker.number.int({ min: 100, max: 5000 }),
      })),
    }),
};

export const postAnalytics: EndpointDefinition = {
  path: "/api/analytics/posts/:id",
  method: "GET",
  type: "secure",
  title: "Post Analytics",
  description: "Returns detailed analytics for a specific post.",
  delay: 200,
  handler: (req: AppRequest) =>
    AppResponse.success({
      postId: req.urlParam("id"),
      stats: {
        totalViews: faker.number.int({ min: 100, max: 50000 }),
        uniqueVisitors: faker.number.int({ min: 80, max: 40000 }),
        avgReadTime: `${faker.number.int({ min: 2, max: 8 })}m`,
        completionRate: faker.number.float({
          min: 0.2,
          max: 0.9,
          fractionDigits: 2,
        }),
        shares: faker.number.int({ min: 0, max: 500 }),
        comments: faker.number.int({ min: 0, max: 80 }),
      },
      referrers: [
        { source: "Direct", visits: faker.number.int({ min: 100, max: 5000 }) },
        { source: "Twitter", visits: faker.number.int({ min: 50, max: 2000 }) },
        { source: "Google", visits: faker.number.int({ min: 50, max: 3000 }) },
        {
          source: "Newsletter",
          visits: faker.number.int({ min: 20, max: 1000 }),
        },
      ],
    }),
};
