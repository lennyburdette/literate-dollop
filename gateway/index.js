import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloGateway } from "@apollo/gateway";

const app = express();
const gateway = new ApolloGateway();
const server = new ApolloServer({ gateway });
await server.start();
server.applyMiddleware({ app, path: "/" });
app.listen(4000, () => console.log(`Gateway running`));
