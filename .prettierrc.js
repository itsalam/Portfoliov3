const prettierPluginTailline = import("prettier-plugin-tailline");
const prettierPluginTailwindCSS = import("prettier-plugin-tailwindcss");

module.exports = {
  useTabs: false,
  trailingComma: "es5",
  printWidth: 80,
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: "always",
  plugins: [
       prettierPluginTailwindCSS, prettierPluginTailline]
};
