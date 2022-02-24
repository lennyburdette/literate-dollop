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

### gateway upgrade

1. install both versions, set up express route to switch between them at runtime
2. yarn shift-traffic

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
