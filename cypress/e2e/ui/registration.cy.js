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

    cy.viewport(1366, 900);
    cy.location("pathname", { timeout: 20000 }).should(
      "include",
      "/panel/garage"
    );

    cy.get("ngb-modal-window, .modal.show", { timeout: 10000 }).should(
      "not.exist"
    );

    cy.document().then((doc) => {
      const sidebarLogout = doc.querySelector("span.icon-logout");
      if (sidebarLogout) {
        cy.wrap(sidebarLogout)
          .closest("a")
          .scrollIntoView()
          .click({ force: true });
      } else {
        cy.contains('button,[role="button"]', /my profile/i, {
          timeout: 10000,
        }).click();
        cy.contains("a,button", /^log ?out$/i, { timeout: 10000 }).click({
          force: true,
        });
      }
    });

    cy.location("pathname", { timeout: 20000 }).should("eq", "/");
  });
});
it("Логін через UI", () => {
  cy.login(email, PWD);
});
