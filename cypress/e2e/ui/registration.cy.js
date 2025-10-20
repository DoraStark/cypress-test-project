/// <reference types="cypress" />
const email = `qa+${Date.now()}@example.com`;
const PWD = "Qauto123";

it("Реєстрація через модалку", () => {
  cy.visit(`https://guest:welcome2qauto@qauto.forstudy.space/`);

  cy.contains("button.hero-descriptor_btn", /^sign up$/i)
    .scrollIntoView()
    .should("be.visible")
    .click();

  cy.get('.modal.show, [role="dialog"]').should("be.visible").as("modal");

  cy.get("@modal").within(() => {
    cy.contains("label", /^name$/i)
      .parent()
      .find("input")
      .type("John");
    cy.contains("label", /^last name$/i)
      .parent()
      .find("input")
      .type("Doe");
    cy.contains("label", /^email$/i)
      .parent()
      .find("input")
      .type(email);
    cy.contains("label", /^password$/i)
      .parent()
      .find("input")
      .type(PWD, { sensitive: true });
    cy.contains("label", /^re-enter password$/i)
      .parent()
      .find("input")
      .type(PWD, { sensitive: true });

    cy.contains("button", /^register$/i)
      .should("not.be.disabled")
      .click();
  });

  cy.url().should("match", /garage|panel|dashboard/i);
  cy.contains(/garage|add car/i, { matchCase: false }).should("exist");
  cy.location("pathname", { timeout: 20000 }).should(
    "match",
    /panel\/garage|garage|dashboard/i
  );

  cy.get("app-panel-layout, .panel-layout", { timeout: 20000 }).should("exist");
  cy.contains("button,a", /my profile/i, { timeout: 20000 }).should(
    "be.visible"
  );
});
