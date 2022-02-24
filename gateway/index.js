import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloGateway } from "@apollo/gateway";

const app = express();
const gateway = new ApolloGateway();
const server = new ApolloServer({ gateway });
await server.start();
server.applyMiddleware({ app });
app.listen(4000).then(() => console.log(`Gateway running`));