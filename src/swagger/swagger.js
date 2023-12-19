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
  apis: ["./src/routes/users/*.js", "./src/routes/profiles/*.js"],
};

const specs = swaggerJsdoc(options);

export default { swaggerUi, specs };

// http://localhost:5000/api-docs/
