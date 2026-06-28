/// <reference path="./.sst/platform/config.d.ts" />

import { readFileSync } from "fs";

function detectFramework(): "nextjs" | "sveltekit" | "static" {
  try {
    const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps["next"]) return "nextjs";
    if (deps["@sveltejs/kit"]) return "sveltekit";
  } catch {}
  return "static";
}

export default $config({
  app(input) {
    return {
      name: process.env.REPO_NAME ?? "app",
      home: "aws",
      removal: input?.stage?.startsWith("pr-") ? "always" : "retain",
    };
  },
  async run() {
    const framework = detectFramework();

    if (framework === "nextjs") {
      new sst.aws.Nextjs("App");
    } else if (framework === "sveltekit") {
      new sst.aws.SvelteKit("App");
    } else {
      new sst.aws.StaticSite("App", {
        build: {
          command: "npm run build",
          output: "dist",
        },
      });
    }
  },
});
