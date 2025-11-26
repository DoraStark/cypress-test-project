// cypress/e2e/ci-smoke.cy.js

describe("CI smoke test", () => {
  it("opens qauto and sees home page", () => {
    cy.visit("https://qauto.forstudy.space/");
    cy.contains("Sign in", { matchCase: false }).should("be.visible");
  });
});
