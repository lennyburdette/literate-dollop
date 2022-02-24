import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloGateway } from "@apollo/gateway";
import Redis from "ioredis";

const app = express();

const redis = new Redis("redis:6379");

const gateway = new ApolloGateway();
const server = new ApolloServer({ gateway });

const gatewayFed2 = new ApolloGateway();
const serverFed2 = new ApolloServer({
  gateway: gatewayFed2,
  apollo: {
    graphRef: "lenny-scratch-1@current-fed2",
  },
});

await Promise.all([server.start(), serverFed2.start()]);

const handler1 = server.getMiddleware({ path: "/" });
const handler2 = serverFed2.getMiddleware({ path: "/" });

app.all("/", async (req, res, next) => {
  const rollout = parseFloat(await redis.get("fed2rollout"));

  if (rollout > Math.random()) {
    console.log("Fed 2");
    handler2(req, res, next);
  } else {
    console.log("Fed 1");
    handler1(req, res, next);
  }
});

app.listen(4000, () => console.log(`Gateway running`));
