module.exports = {
  globDirectory: "dist",
  globPatterns: [
    "**/*.{css,html,ico,js,json,png,svg}",
    "**/node_modules/.pnpm/**/MaterialCommunityIcons.*.ttf",
  ],
  globIgnores: ["**/sw.js"],
  maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
  navigateFallback: "index.html",
  swDest: "dist/sw.js",
};
