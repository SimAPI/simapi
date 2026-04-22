import { defineConfig } from "vitepress";

export default defineConfig({
  title: "SimAPI Docs",
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
          { text: "Authentication", link: "/guide/authentication" },
          { text: "Configuration", link: "/guide/config" },
          { text: "Debug Console", link: "/guide/console" },
          { text: "OpenAPI Import & Export", link: "/guide/openapi-import" },
          { text: "FAQ", link: "/guide/faq" },
        ],
      },
      {
        text: "Deployment",
        items: [
          { text: "Overview", link: "/deployment/" },
          { text: "Vercel", link: "/deployment/vercel" },
          { text: "Netlify", link: "/deployment/netlify" },
          { text: "Railway", link: "/deployment/railway" },
          { text: "Other Hosts", link: "/deployment/other-hosts" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "EndpointDefinition", link: "/api/endpoint-definition" },
          { text: "RequestDefinition", link: "/api/request-definition" },
          { text: "AuthHandler", link: "/api/auth-handler" },
          { text: "AppRequest", link: "/api/app-request" },
          { text: "AppResponse", link: "/api/app-response" },
          { text: "Validation", link: "/api/validator" },
          { text: "defineConfig", link: "/api/define-config" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Blog API", link: "/examples/blog-sample" },
          { text: "Shop API", link: "/examples/shop-sample" },
        ],
      },
      {
        text: "Changelog",
        items: [
          { text: "@simapi/simapi", link: "/changelog/simapi" },
          { text: "@simapi/console", link: "/changelog/console" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/SimAPI/simapi" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 - Present MayR Labs",
    },

    editLink: {
      pattern: "https://github.com/SimAPI/simapi/edit/main/apps/docs/:path",
      text: "Edit this page on GitHub",
    },

    outline: {
      level: [2, 3],
      label: "Outline",
    },
  },

  ignoreDeadLinks: "localhostLinks",
});
