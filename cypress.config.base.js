const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportFilename: "mochawesome",
    reportDir: "reports/mochawesome",
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    overwrite: true,
  },
  videosFolder: "reports/videos",
  screenshotsFolder: "reports/screenshots",
  retries: 1,
  e2e: {
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    },
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
  },
});
