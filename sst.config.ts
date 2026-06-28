/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: process.env.REPO_NAME ?? "app",
      home: "aws",
      removal: input?.stage?.startsWith("pr-") ? "remove" : "retain",
    };
  },
  async run() {
    const { readFileSync } = await import("fs");

    function detectFramework(): "nextjs" | "sveltekit" | "static" {
      try {
        const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps["next"]) return "nextjs";
        if (deps["@sveltejs/kit"]) return "sveltekit";
      } catch {}
      return "static";
    }

    const framework = detectFramework();

    let url: $util.Output<string>;

    if (framework === "nextjs") {
      const site = new sst.aws.Nextjs("Web");
      url = site.url;
    } else if (framework === "sveltekit") {
      const site = new sst.aws.SvelteKit("Web");
      url = site.url;
    } else {
      const site = new sst.aws.StaticSite("Web", {
        build: {
          command: "npm run build",
          output: "dist",
        },
      });
      url = site.url;
    }

    return { url };
  },
});
