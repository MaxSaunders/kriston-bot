# Kriston Bot

A discord bot to learn Discord.js and Google Cloud App Engine

## Tools

-   Typescript
-   Discord.js
-   Express.js

## To Deploy

-   gcloud init
-   gcloud app deploy

### Package.json

We use npx ts-node to run the .ts files and allow the google app engine to run them as well. Any other commands I found don't work in the app engine env without more configuration.

```json
"scripts": {
    "start": "npx ts-node src/index.ts",
    "dev": "nodemon src/index.ts",
    "gcp-build": "tsc -p .",
    "deploy": "gcloud app deploy"
},
```

### app.yaml

```yaml
runtime: nodejs20
instance_class: F4

# This is optional, but for this bot we want to ensure we have 1 instance
automatic_scaling:
    min_instances: 1
    max_instances: 1
```

### TS Configs

-   "target": "es2016"
-   "module": "CommonJS"
-   Be sure to add typescript and any type defenitions to the `dependencies` object in package.json, not just `devDependencies`

### Ideas

-   Random Team Generator
    -   add a button to reroll teams
-   Youtube Music Player
-   Letterboxd Api Attachment
