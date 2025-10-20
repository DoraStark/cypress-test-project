/// <reference types="cypress" />

it("A) visit with auth option", () => {
  cy.visit("/", {
    auth: { username: "guest", password: "welcome2qauto" },
  });
  cy.location("hostname").should("eq", "qauto.forstudy.space");
  cy.contains(/log in/i).should("be.visible");
});

it("B) visit with URL creds", () => {
  cy.visit("https://guest:welcome2qauto@qauto.forstudy.space/");
  cy.location("hostname").should("eq", "qauto.forstudy.space");
  cy.contains(/log in/i).should("be.visible");
});

it("C) request check", () => {
  cy.request({
    url: "https://qauto.forstudy.space/",
    auth: { username: "guest", password: "welcome2qauto" },
    failOnStatusCode: false,
  }).then((r) => {
    expect([200, 301, 302]).to.include(r.status);
  });
});
