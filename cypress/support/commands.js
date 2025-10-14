Cypress.Commands.add("visitWithAuth", (path = "/", options = {}) => {
  return cy.visit(path, {
    auth: {
      username: Cypress.env("BASIC_AUTH_USER"),
      password: Cypress.env("BASIC_AUTH_PASS"),
    },
    ...options,
  });
});

Cypress.Commands.add("acceptCookiesIfAny", () => {
  const sel =
    "#onetrust-accept-btn-handler, .cookie-accept, .cc-allow, " +
    '[aria-label*="Accept"], [aria-label*="Akzeptieren"]';
  cy.get("body", { includeShadowDom: true }).then(($b) => {
    if ($b.find(sel).length) {
      cy.get(sel, { includeShadowDom: true })
        .filter(":visible")
        .first()
        .click({ force: true });
    }
  });
});

Cypress.Commands.add("getHeaderLinksAndButtons", () => {
  const roots = 'app-header, header, [data-testid="header"], .header';
  return cy.get("body").then(($b) => {
    const hasNav = $b.find(`${roots} nav`).length > 0;
    const scope = hasNav ? `${roots} nav` : roots;
    return cy
      .get(
        `${scope} a, ${scope} button, ${scope} [role="button"], ${scope} [role="menuitem"]`
      )
      .filter(":visible")
      .filter(
        (i, el) => !el.disabled && el.getAttribute("aria-hidden") !== "true"
      );
  });
});
