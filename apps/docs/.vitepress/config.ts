import { defineConfig } from "vitepress";

export default defineConfig({
  title: "SimAPI",
  description:
    "A local-first backend simulator for frontend developers — build against real API behavior before your backend exists.",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],

  sitemap: {
    hostname: "https://simapi.mayrlabs.com",
  },

  themeConfig: {
    logo: "/simapi.png",

    search: { provider: "local" },

    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/app-request" },
      { text: "GitHub", link: "https://github.com/SimAPI/simapi" },
      { text: "Team", link: "/team" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/" },
          { text: "Defining Endpoints", link: "/guide/endpoints" },
          { text: "Configuration", link: "/guide/config" },
          { text: "OpenAPI Import", link: "/guide/openapi-import" },
          { text: "Deployment", link: "/guide/deployment" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "AppRequest", link: "/api/app-request" },
          { text: "AppResponse", link: "/api/app-response" },
          { text: "Validation", link: "/api/validator" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/SimAPI/simapi" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 - Present MayR Labs",
    },
  },

  ignoreDeadLinks: "localhostLinks",
});
