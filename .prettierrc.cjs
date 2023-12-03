/** @type {import("prettier").Config} */
module.exports = {
  pluginSearchDirs: [__dirname],
  plugins: [require.resolve("prettier-plugin-astro")],
  singleQuote: false,
  endOfLine: "lf",
  jsxSingleQuote: false,
  useTabs: false,
  tabWidth: 2,
  semi: true,
  printWidth: 80,
  trailingComma: "all",
  overrides: [
    {
      files: ["*.astro", "*.html"],
      options: {
        parser: "astro",
        singleQuote: false
      }
    }
  ]
}
