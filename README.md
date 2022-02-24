1. fork repo
2. clone locally
3. add personal api key and graphref to .env
4. yarn setup
   - create graph
   - put api key and graphref in gateway.env
   - add secret to github
5. run initial publish
6. run docker compose up
7. yarn seed

```
source gateway.env
gh secret set APOLLO_KEY -b"${APOLLO_KEY}"
gh secret set APOLLO_GRAPH_REF -b"${APOLLO_GRAPH_REF}"
gh workflow run "Initial Publish"
```

### readiness

```sh
source .env
export APOLLO_KEY=$APOLLO_ADMIN_KEY
export APOLLO_GRAPH_REF=$APOLLO_GRAPH_REF
npx apollosolutions/federation-2-readiness --graphref $APOLLO_GRAPH_REF
```

reviews/schema.graphql

```
- product: Product @provides(fields: "price")
+ product: Product @provides(fields: "price { amount currencyCode }")
```

### gateway upgrade

```json
"@apollo/gateway": "^2.0.0-alpha.6",
"@apollo/gateway-1": "npm:@apollo/gateway@^0.48.1",
...
"ioredis": "^4.28.5"
```

```js
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
```

```
redis-cli
> SET gateway2rollout 0.5
```

### build configuration

1. change publish workflow to double publish to new variant
2. commit, push, merge
3. update build config in studio for new variant
4. update check config to include traffic for new variant
5. update check workflow to check both variants
6. commit, push (see results), merge
7. update gateway to support run both variants
8. remove `|| true` from workflows
9. yarn shift-traffic

### clean up

1. change build config for prod variant to fed2
2. shift traffic back
3. remove double check/publish
4. delete temp variant

### subgraph
