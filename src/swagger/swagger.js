import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "2.0.0",
      title: "OMO",
      description:
        "Node.js Swagger using swagger-jsdoc for Restful APIs with UI",
    },
    servers: [
      {
        // url: "https://mohaji.site",
        url: "http://localhost:3003",
      },
    ],
  },
  apis: [
    "./src/swagger/user.js",
    "./src/swagger/kakao.js",
    "./src/swagger/profile.js",
    "./src/swagger/main.js",
    "./src/swagger/posts.js",
    "./src/swagger/comment.js",
    "./src/swagger/replies.js",
    "./src/swagger/location.js",
    "./src/swagger/isLike.js",
    "./src/swagger/bookmark.js",
    "./src/swagger/searching.js",
    "./src/swagger/following.js",
  ],
};

const specs = swaggerJsdoc(options);

export default { swaggerUi, specs };

// https://mohaji.site/api-docs/
// http://localhost:3003/api-docs/
