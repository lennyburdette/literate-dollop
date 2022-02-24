import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloGateway as ApolloGateway2 } from "@apollo/gateway";
import { ApolloGateway as ApolloGateway1 } from "@apollo/gateway-1";
import Redis from "ioredis";

const app = express();

const redis = new Redis("redis:6379");

const gateway1 = new ApolloGateway1();
const server1 = new ApolloServer({ gateway: gateway1 });

const gateway2 = new ApolloGateway2();
const server2 = new ApolloServer({ gateway: gateway2 });

await Promise.all([server1.start(), server2.start()]);

const handler1 = server1.getMiddleware({ path: "/" });
const handler2 = server2.getMiddleware({ path: "/" });

app.all("/", async (req, res, next) => {
  const rollout = parseFloat(await redis.get("gateway2rollout"));

  if (rollout > Math.random()) {
    console.log("gateway 2");
    handler2(req, res, next);
  } else {
    console.log("gateway 1");
    handler1(req, res, next);
  }
});

app.listen(4000, () => console.log(`Gateway running`));
