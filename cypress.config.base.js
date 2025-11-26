const { defineConfig } = require("cypress");

module.exports = defineConfig({
  videosFolder: "reports/videos",
  screenshotsFolder: "reports/screenshots",
  retries: 1,
  e2e: {
    setupNodeEvents(on, config) {
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
  },
});
