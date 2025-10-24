const { defineConfig } = require("cypress");
const base = require("./cypress.config.base");

module.exports = defineConfig({
  ...base,
  e2e: {
    ...base.e2e,
    baseUrl: "https://qauto.forstudy.space",
    env: {
      basicAuthUser: "guest",
      basicAuthPass: "welcome2qauto",
      appEmail: "your_user_qauto+001@example.com",
      appPassword: "Qauto123!",
    },
  },
});
