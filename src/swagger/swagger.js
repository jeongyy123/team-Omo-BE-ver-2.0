import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "OMO",
      description:
        "Node.js Swagger using swagger-jsdoc for Restful APIs with UI",
    },
    servers: [
      {
        url: "https://tonadus.shop",
      },
    ],
  },
  apis: [
    "./src/routes/users/*.js",
    "./src/routes/profiles/*.js",
    "./src/routes/locations/*.js",
    "./src/routes/comments/*.js",
    "./src/routes/replies/*.js",
    "./src/routes/main/*.js",
    "./src/routes/bookmark/*.js",
    "./src/routes/isLike/*.js",
    "./src/routes/posts/*.js",
    "./src/routes/searching/*.js",
  ],
};

const specs = swaggerJsdoc(options);

export default { swaggerUi, specs };

// https://tonadus.shop/api-docs/
