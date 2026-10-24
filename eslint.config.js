import eslintPluginAstro from "eslint-plugin-astro";

export default [
  { ignores: ["dist/", ".astro/", ".netlify/"] },
  ...eslintPluginAstro.configs["flat/recommended"],
];
