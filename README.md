# Tauri example app with updater server

This is an example of a Tauri app with an updater server.

> **Note:** This is a work in progress. This should technically be a mono repo using something NX or Turbo, but I'm not there yet. You can still use this as a reference for your own project. These two folders can be 2 diffrent repos for you, will probably make things easier.

## Things you need to make everything work

### Updater server

I recommend using [Cloudflare workers](https://workers.cloudflare.com/) for the updater server. It's free and easy to use. You can use any serverless platform you want. Its just easy to setup a server that responds to GET requests.

Take a look at index.ts in the updater-server folder. You will need to look at:

```ts
export interface Env {
  GITHUB_PERSONAL_TOKEN: string;
  DEPLOYED_WORKER_URL: string;
  GITHUB_USERNAME: string;
  REPO_TAG: string; // org_name/repo_name
}
```

and add all of these in your .env file. Also the same variables in the cloudflare dashboard and everything should "just" work once you deploy the worker with wrangler.

### Tauri app

You will need to checkout

```ts
    "updater": {
      "active": true,
      "dialog": false,
      "pubkey": "YOUR_PUBKEY",
      "endpoints": ["https://YOUR_CLOUDFLARE_DEPLOYED_URl/api/check_update"]
    },
```

in tauri.conf.json and add your pubkey, the deployed url of your cloudflare worker, and a private key.
The actual Tauri Docs are amazing for this: https://tauri.app/v1/guides/distribution/updater/
