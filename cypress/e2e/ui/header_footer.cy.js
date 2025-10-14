describe("Landing: header & footer elements", () => {
  beforeEach(() => {
    Cypress.config("pageLoadTimeout", 180000);
    Cypress.config("defaultCommandTimeout", 15000);
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/", {
      auth: { username: "guest", password: "welcome2qauto" },
      timeout: 180000,
      failOnStatusCode: false,
    });
    cy.document({ timeout: 120000 }).its("readyState").should("eq", "complete");
    cy.acceptCookiesIfAny();
    cy.get("app-home", { timeout: 20000 }).should("exist");
    cy.get("#contactsSection", { timeout: 20000 }).should("exist");
  });

  it("header: знаходить усі видимі лінки/кнопки та перевіряє базові властивості", () => {
    cy.getHeaderLinksAndButtons().then(($els) => {
      expect($els.length).to.be.gte(3);
      cy.wrap($els).each(($el) => {
        cy.wrap($el)
          .should("be.visible")
          .and(($e) => {
            const node = $e.get(0);
            if (node.tagName.toLowerCase() === "a")
              expect(node).to.have.attr("href");
          });
      });
      const headerTexts = $els
        .map((_, el) => el.innerText.trim())
        .get()
        .join(" | ");
      expect(headerTexts).to.match(
        /login|sign ?in|anmelden|signin|sign ?up|register|registrieren/i
      );
    });
  });

  it("hero: є принаймні один видимий CTA у hero-блоці", () => {
    cy.get("app-home .section.hero").should("be.visible");
    cy.get("app-home .section.hero")
      .find("a,button")
      .filter(":visible")
      .should("have.length.at.least", 1);
  });

  it("footer: знаходить усі лінки/кнопки та перевіряє соцмережі, сайт і пошту", () => {
    cy.fixture("footerTargets.json").then((targets) => {
      cy.getFooterLinksAndButtons().then(($els) => {
        expect($els.length).to.be.gte(5);
        const hrefs = $els
          .map((_, el) => el.getAttribute("href") || "")
          .get()
          .map((h) => h.toLowerCase());
        targets.social.forEach((needle) =>
          expect(hrefs.some((h) => h.includes(needle))).to.eq(true)
        );
        expect(hrefs.some((h) => h.includes(targets.site))).to.eq(true);
        expect(
          hrefs.some((h) => h === targets.supportMail.toLowerCase())
        ).to.eq(true);
      });
    });
  });

  it("footer: усі елементи видимі та активні", () => {
    cy.getFooterLinksAndButtons().each(($el) => {
      cy.wrap($el).should("be.visible").and("not.be.disabled");
    });
  });

  it("соцмережі у блоці Contacts присутні", () => {
    cy.getFooterSocialLinks().within(() => {
      cy.get('a[href*="facebook"]').should("exist");
      cy.get('a[href*="t.me"], a[href*="telegram"]').should("exist");
      cy.get('a[href*="youtube"], a[href*="youtu.be"]').should("exist");
      cy.get('a[href*="instagram"]').should("exist");
      cy.get('a[href*="linkedin"]').should("exist");
    });
  });
});
