/// <reference types="cypress" />

const CONTACTS = [
  {
    key: "facebook",
    hrefPart: "facebook.com/Hillel.IT.School",
    classIcon: "icon-facebook",
  },
  { key: "telegram", hrefPart: "t.me/ithillel_kyiv" },
  {
    key: "youtube",
    hrefPart: "youtube.com/user/HillelITSchool?sub_confirmation=1",
  },
  { key: "instagram", hrefPart: "instagram.com/hillel_itschool" },
  { key: "linkedin", hrefPart: "linkedin.com/school/ithillel" },
];

describe("Header & Contacts (adapted to current DOM)", () => {
  beforeEach(() => {
    cy.visitWithAuth("/");
    cy.acceptCookiesIfAny();
  });

  it("Header: усі кнопки та посилання існують і валідні", () => {
    cy.getHeaderLinksAndButtons()
      .should("have.length.at.least", 2)
      .each(($el) => {
        const isLink = $el.is("a");
        cy.wrap($el).should("be.visible");

        if (isLink) {
          cy.wrap($el)
            .should("have.attr", "href")
            .then((href) => {
              expect(href, "href should be valid link").to.match(
                /^(https?:\/\/|#|mailto:|tel:|\/|\.\/|\.\.\/)/
              );
            });
        } else {
          cy.wrap($el).should("not.be.disabled");
        }

        const txt = ($el.text() || "").trim();
        const aria = $el.attr("aria-label") || "";
        expect(
          txt.length > 0 || aria.length > 0,
          "has text or aria-label"
        ).to.eq(true);
      });
  });

  it("Contacts: контейнер та заголовок існують", () => {
    cy.get("#contactsSection").should("exist").and("be.visible");
    cy.get("#contactsSection h2").contains(/contacts/i);
    cy.get("#contactsSection .contacts_socials.socials")
      .should("exist")
      .and("be.visible");
  });

  it("Contacts: кожне посилання є, має правильный href, target, rel та іконку", () => {
    cy.get("#contactsSection .contacts_socials.socials")
      .find("a.socials_link")
      .as("socialLinks")
      .should("have.length.at.least", CONTACTS.length);

    CONTACTS.forEach(({ key, hrefPart, classIcon }) => {
      cy.get("@socialLinks")
        .filter(`[href*="${hrefPart}"]`)
        .should("have.length.at.least", 1)
        .first()
        .as(`link_${key}`);

      cy.get(`@link_${key}`)
        .should("have.attr", "href")
        .and("include", hrefPart);
      cy.get(`@link_${key}`).should("have.attr", "target", "_blank");

      cy.get(`@link_${key}`)
        .invoke("attr", "rel")
        .then((rel) => {
          if (rel) expect(rel).to.match(/nofollow|noopener|noreferrer/);
        });

      cy.get(`@link_${key}`)
        .find("span.socials_icon.icon")
        .should("exist")
        .then(($span) => {
          if (classIcon) expect($span.attr("class")).to.include(classIcon);
        });
    });
  });
});
