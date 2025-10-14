const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://qauto.forstudy.space",
    viewportWidth: 1366,
    viewportHeight: 768,
    video: false,
    retries: 1,
    env: {
      BASIC_AUTH_USER: "guest",
      BASIC_AUTH_PASS: "welcome2qauto",
    },
  },
});
