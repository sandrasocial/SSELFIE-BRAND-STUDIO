import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SSELFIE Studio API Documentation',
      version: '1.0.0',
      description: 'API documentation for SSELFIE Studio platform',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'API Server',
      },
    ],
  },
  apis: ['./server/routes/*.ts'], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
export const serve = swaggerUi.serve;
export const setup = swaggerUi.setup(specs);