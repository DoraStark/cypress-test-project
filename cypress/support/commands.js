Cypress.Commands.add("acceptCookiesIfAny", () => {
  const rx =
    /(accept|agree|ok|allow|got it|zustimmen|einverstanden|akzeptieren|alle.*акzeptieren|принять|согласен)/i;
  cy.document().then((doc) => {
    const btn = [...doc.querySelectorAll('button,[role="button"],a')].find(
      (el) => rx.test(el.textContent || "")
    );
    if (btn) cy.wrap(btn).click({ force: true, scrollBehavior: false });
  });
  const sel =
    '[aria-label*="Accept"],[aria-label*="Akzeptieren"],.cookie-accept,.cc-allow,.js-accept-cookies,.accept-cookie,' +
    "#onetrust-accept-btn-handler,#accept-cookies,.ot-sdk-container .ot-sdk-button";
  cy.get("body").then(($b) => {
    if ($b.find(sel).length) cy.get(sel).first().click({ force: true });
  });
});

Cypress.Commands.add("getHeaderLinksAndButtons", () => {
  const roots = 'header, [data-testid="header"], .header';
  return cy.get("body").then(($b) => {
    const hasNav = $b.find(`${roots} nav`).length > 0;
    const scope = hasNav ? `${roots} nav` : roots;
    return cy.get(`${scope} a, ${scope} button`).filter(":visible");
  });
});

Cypress.Commands.add("getFooterLinksAndButtons", () => {
  const roots = 'footer, [data-testid="footer"], .footer';
  return cy
    .get(`${roots} a, ${roots} button`, { timeout: 20000 })
    .filter(":visible");
});

Cypress.Commands.add("getFooterSocialLinks", () => {
  cy.location("pathname", { timeout: 15000 }).then((p) => {
    if (p !== "/")
      cy.visit("/", { auth: { username: "guest", password: "welcome2qauto" } });
  });
  cy.get("app-home", { timeout: 20000 }).should("exist");
  return cy.get("#contactsSection .contacts_socials", { timeout: 20000 });
});
