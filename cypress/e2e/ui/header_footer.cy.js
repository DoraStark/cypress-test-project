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

describe("Хедер, героїн-блок та Contacts", () => {
  beforeEach(() => {
    cy.visitWithAuth("/");
    cy.acceptCookiesIfAny();
    cy.get("app-home", { timeout: 20000 }).should("exist");
  });

  it("Хедер: усі видимі кнопки та посилання валідні", () => {
    cy.getHeaderLinksAndButtons()
      .should("have.length.at.least", 2)
      .each(($el) => {
        const isLink = $el.is("a");
        cy.wrap($el).should("be.visible");
        if (isLink) {
          cy.wrap($el)
            .should("have.attr", "href")
            .then((href) => {
              expect(href).to.match(
                /^(https?:\/\/|#|mailto:|tel:|\/|\.\/|\.\.\/)/
              );
            });
        } else {
          cy.wrap($el).should("not.be.disabled");
        }
        const txt = ($el.text() || "").trim();
        const aria = $el.attr("aria-label") || "";
        expect(txt.length > 0 || aria.length > 0).to.eq(true);
      });
  });

  it("Геро-блок: кнопка Sign up присутня і видима", () => {
    cy.get("app-home", { timeout: 20000 }).should("exist");
    cy.get("section.section.hero").should("exist").and("be.visible");

    cy.get(".hero-descriptor button.hero-descriptor_btn.btn.btn-primary", {
      timeout: 20000,
    })
      .should("be.visible")
      .and("contain.text", "Sign up")
      .and("not.be.disabled");
  });

  it("Contacts: секція та заголовок присутні", () => {
    cy.get("#contactsSection", { timeout: 20000 })
      .should("exist")
      .and("be.visible");
    cy.get("#contactsSection h2").contains(/contacts/i);
    cy.get("#contactsSection .contacts_socials.socials")
      .should("exist")
      .and("be.visible");
  });

  it("Contacts: соцпосилання присутні й мають правильні атрибути", () => {
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

  it("Contacts: присутні посилання на ithillel.ua та e-mail підтримки", () => {
    cy.get("#contactsSection", { timeout: 20000 })
      .find("a[href]")
      .then(($links) => {
        const hrefs = [...$links].map((a) => a.getAttribute("href") || "");
        expect(hrefs.join(" ")).to.include("https://ithillel.ua");
        const joined = hrefs.join(" ");
        expect(
          joined.includes("mailto:developer@ithillel.ua") ||
            joined.includes("mailto:support@ithillel.ua")
        ).to.eq(true);
        cy.wrap($links)
          .filter('[href*="ithillel.ua"]')
          .first()
          .should("have.attr", "target", "_blank")
          .invoke("attr", "rel")
          .then((rel) => {
            if (rel) expect(rel).to.match(/nofollow|noopener|noreferrer/);
          });
      });
  });
});
