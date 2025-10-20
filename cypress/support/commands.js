Cypress.Commands.add("visitWithAuth", (path = "/") => {
  cy.visit(`https://guest:welcome2qauto@qauto.forstudy.space${path}`);
});

Cypress.Commands.add("openLogin", () => {
  cy.visitWithAuth("/");

  cy.contains("a,button", /guest log in|sign in/i).click({ force: true });

  cy.get("body").then(($b) => {
    if ($b.find('[role="dialog"], .modal').length) {
      cy.contains('[role="dialog"], .modal', /log ?in/i).should("be.visible");
    } else {
      cy.location("pathname").should("include", "/panel/login");
    }
  });
});

Cypress.Commands.add("openRegistration", () => {
  cy.visitWithAuth("/");

  cy.contains("button", /^sign up$/i)
    .scrollIntoView()
    .click({ force: true });

  cy.get("body", { timeout: 4000 }).then(($b) => {
    if ($b.find('[role="dialog"], .modal:contains("Registration")').length) {
      cy.contains('[role="dialog"], .modal', /registration/i).should(
        "be.visible"
      );
    } else {
      cy.contains("a,button", /sign in|guest log in/i).click({ force: true });
      cy.get('[role="dialog"], .modal').should("be.visible");
      cy.contains(
        '[role="dialog"], .modal a, [role="dialog"], .modal button',
        /registration|sign up/i
      ).click({ force: true });
      cy.contains('[role="dialog"], .modal', /registration/i).should(
        "be.visible"
      );
    }
  });
});

Cypress.Commands.add(
  "getInputByLabel",
  { prevSubject: "element" },
  (subject, labelText) => {
    return cy
      .wrap(subject)
      .contains("label", new RegExp(`^${labelText}$`, "i"))
      .parent()
      .find("input, textarea");
  }
);

Cypress.Commands.overwrite("type", (orig, el, text, options) => {
  if (options && options.sensitive) {
    options.log = false;
    Cypress.log({
      $el: el,
      name: "type",
      message: "*".repeat(String(text).length),
    });
  }
  return orig(el, text, options);
});
