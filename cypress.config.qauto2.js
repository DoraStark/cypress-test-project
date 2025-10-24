const { defineConfig } = require("cypress");
const base = require("./cypress.config.base");

module.exports = defineConfig({
  ...base,
  e2e: {
    ...base.e2e,
    baseUrl: "https://qauto2.forstudy.space",
    env: {
      basicAuthUser: "guest",
      basicAuthPass: "welcome2qauto",
      appEmail: "your_user_qauto2+001@example.com",
      appPassword: "Qauto123!",
    },
  },
});
