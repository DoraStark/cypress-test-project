const { defineConfig } = require("cypress");

module.exports = defineConfig({
  pageLoadTimeout: 180000,
  defaultCommandTimeout: 15000,
  requestTimeout: 20000,
  responseTimeout: 40000,
  chromeWebSecurity: false,
  e2e: {
    baseUrl: "https://qauto.forstudy.space",
    viewportWidth: 1366,
    viewportHeight: 800,
    video: false,
    retries: 1,
    supportFile: "cypress/support/e2e.js",
  },
});
