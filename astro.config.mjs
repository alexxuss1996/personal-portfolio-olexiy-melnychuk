import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import netlify from "@astrojs/netlify/functions";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    icon({
      include: {
        ph: ["*"],
        "simple-icons": ["*"],
        fa: ["*"],
      },
    }),
  ],
  output: "server",
  adapter: netlify(),
});
