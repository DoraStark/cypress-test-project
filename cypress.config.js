const { defineConfig } = require("cypress");
module.exports = defineConfig({
  e2e: {
    baseUrl: "https://qauto.forstudy.space",
    viewportWidth: 1366,
    viewportHeight: 768,
    video: false,
    retries: 1,
  },
});
