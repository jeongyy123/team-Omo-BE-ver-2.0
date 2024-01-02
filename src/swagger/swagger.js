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
    "./src/swagger/user.js",
    "./src/swagger/kakao.js",
    "./src/swagger/profile.js",
    "./src/swagger/main.js",
    "./src/swagger/posts.js",
    "./src/routes/comments/*.js",
    "./src/routes/replies/*.js",
    "./src/routes/locations/*.js",
    "./src/swagger/isLike.js",
    "./src/swagger/bookmark.js",
    "./src/swagger/searching.js",
  ],
};

const specs = swaggerJsdoc(options);

export default { swaggerUi, specs };

// https://tonadus.shop/api-docs/
