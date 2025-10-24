/// <reference types="cypress" />

console.log("commands.js LOADED v3");

Cypress.Commands.add("visitWithAuth", (path = "/") => {
  const u = Cypress.env("basicAuthUser");
  const p = Cypress.env("basicAuthPass");
  const baseUrl = Cypress.config("baseUrl") || "https://qauto.forstudy.space";
  const url = new URL(baseUrl);
  url.username = u || "";
  url.password = p || "";
  cy.visit(`${url.toString().replace(/\/$/, "")}${path}`);
});

Cypress.Commands.add("login", (email, password) => {
  cy.visitWithAuth("/panel/login");

  cy.get('input[type="email"], input[name="email"]', { timeout: 15000 })
    .should("be.visible")
    .first()
    .clear()
    .type(email);

  cy.get('input[type="password"], input[name="password"]')
    .first()
    .clear()
    .type(password, { sensitive: true });

  cy.contains("button", /log in|sign in/i, { timeout: 15000 })
    .should("be.visible")
    .click({ force: true });

  cy.contains("a,button", /garage|profile|fuel expenses|logout/i, {
    timeout: 20000,
  }).should("be.visible");
});

Cypress.Commands.overwrite(
  "type",
  (originalFn, element, text, options = {}) => {
    if (options.sensitive) {
      options.log = false;
      Cypress.log({
        $el: element,
        name: "type",
        message: "*".repeat(String(text).length),
      });
    }
    return originalFn(element, text, options);
  }
);

const getFormScope = () =>
  cy.get("body").then(($b) => {
    if ($b.find(".modal.show,[role='dialog']").length) {
      return cy.get(".modal.show,[role='dialog']");
    }
    return cy.wrap($b);
  });

Cypress.Commands.add("registerNewUniqueUser", (opts = {}) => {
  const name = opts.name || "John";
  const lastName = opts.lastName || "Doe";
  const password = opts.password || "Qauto123!";
  const email = `${opts.prefix || "qa"}_${Date.now()}_${Math.floor(
    Math.random() * 1e6
  )}@example.com`;

  cy.wrap({ email, password, name, lastName }).as("uniqueUser");

  cy.visitWithAuth("/");

  cy.contains("a,button", /sign up|register/i, { timeout: 15000 })
    .scrollIntoView()
    .click({ force: true });

  getFormScope()
    .find("form, input, button", { timeout: 15000 })
    .should("be.visible");

  getFormScope().then(($s) => {
    const onLogin =
      $s.find('label:contains("Email"),label:contains("Password")').length >
        0 &&
      $s.find('button:contains("Log in"),button:contains("Sign in")').length >
        0;
    if (onLogin)
      cy.contains("button,a", /sign up|register/i).click({ force: true });
  });

  cy.intercept("POST", "**/api/auth/signup").as("signup");

  getFormScope().within(() => {
    cy.contains("label", /^name$/i)
      .parent()
      .find("input")
      .clear()
      .type(name);
    cy.contains("label", /(last\s*name|surname)/i)
      .parent()
      .find("input")
      .clear()
      .type(lastName);
    cy.contains("label", /^email$/i)
      .parent()
      .find("input")
      .clear()
      .type(email);
    cy.contains("label", /^password$/i)
      .parent()
      .find("input")
      .clear()
      .type(password, { sensitive: true });
    cy.contains("label", /(re-?enter|confirm)\s*password/i)
      .parent()
      .find("input")
      .clear()
      .type(password, { sensitive: true });
    cy.contains("button,input[type='submit']", /register|sign up/i).click({
      force: true,
    });
  });

  cy.wait("@signup", { timeout: 20000 })
    .its("response.statusCode")
    .should((code) => expect([200, 201]).to.include(code));

  cy.location("pathname", { timeout: 20000 }).then((p) => {
    if (!p.includes("/panel/garage")) {
      cy.get("@uniqueUser").then(({ email, password }) => {
        cy.login(email, password);
      });
    }
  });

  cy.location("pathname", { timeout: 20000 }).should(
    "include",
    "/panel/garage"
  );
  cy.contains("button,a", /^add car$/i, { timeout: 20000 }).should(
    "be.visible"
  );
});

Cypress.Commands.add("addCarUI", ({ brand, model, mileage }) => {
  cy.contains("button,a", /^add car$/i, { timeout: 15000 })
    .should("be.visible")
    .click();

  cy.get(".modal.show,[role='dialog']", { timeout: 15000 }).as("dlg");

  cy.intercept("GET", "**/api/cars/models*").as("models");

  cy.get("@dlg")
    .contains("label", /brand/i)
    .parent()
    .find("select")
    .should("be.enabled")
    .select(brand, { force: true });

  cy.wait("@models");

  cy.get("@dlg")
    .contains("label", /model/i)
    .parent()
    .find("select")
    .should("be.enabled")
    .select(model, { force: true });

  cy.get("@dlg")
    .contains("label", /mileage|odometer/i)
    .parent()
    .find("input[type='number'], input")
    .clear()
    .type(String(mileage));

  cy.get("@dlg").contains("button,input[type='submit']", /^add$/i).click();

  cy.contains(".toast,.alert,[role='status']", /added|success/i, {
    timeout: 15000,
  }).should("be.visible");
  cy.contains(".car, .card, tr", brand, { timeout: 15000 }).should("exist");
});
