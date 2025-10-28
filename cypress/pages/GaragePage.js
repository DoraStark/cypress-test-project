// cypress/pages/GaragePage.js
export default class GaragePage {
  open() {
    cy.contains("a,button", /^garage$/i).click({ force: true });
    cy.location("pathname").should("include", "/panel/garage");
  }

  addCar({ brand, model, mileage }) {
    cy.intercept("GET", "**/api/cars/models*").as("models");
    cy.intercept("POST", "**/api/cars").as("createCar");

    cy.contains("button,a", /^add car$/i, { timeout: 15000 })
      .should("be.visible")
      .click();

    cy.get(".modal.show,[role='dialog']", { timeout: 15000 })
      .as("carDlg")
      .should("be.visible");

    cy.get("@carDlg")
      .contains("label", /brand/i)
      .parent()
      .find("select")
      .should("be.enabled")
      .then(($sel) => {
        const desired = brand;
        const currentText = $sel.find("option:selected").text().trim();
        const hasAlt = $sel.find("option").length > 1;
        if (currentText.toLowerCase() === desired.toLowerCase()) {
          if (hasAlt) {
            const alt = Array.from($sel[0].options)
              .map((o) => o.text.trim())
              .find((t) => t && t.toLowerCase() !== desired.toLowerCase());
            if (alt) {
              cy.wrap($sel).select(alt, { force: true });
              cy.wait("@models", { timeout: 10000 });
              cy.wrap($sel).select(desired, { force: true });
              cy.wait("@models", { timeout: 10000 });
              return;
            }
          }
          cy.wrap($sel);
        } else {
          cy.wrap($sel).select(desired, { force: true });
          cy.wait("@models", { timeout: 10000 });
        }
      });

    cy.get("@carDlg")
      .contains("label", /model/i)
      .parent()
      .find("select")
      .should("be.enabled")
      .find("option")
      .its("length")
      .should("be.greaterThan", 0);

    cy.get("@carDlg")
      .contains("label", /model/i)
      .parent()
      .find("select")
      .select(model, { force: true });

    cy.get("@carDlg")
      .contains("label", /mileage|odometer/i)
      .parent()
      .find("input")
      .clear()
      .type(String(mileage));

    cy.get("@carDlg")
      .contains("button,input[type='submit']", /^add$/i)
      .click({ force: true });

    cy.wait("@createCar").then(({ response }) => {
      expect([200, 201]).to.include(response?.statusCode);
      const body = response?.body || {};
      const carId =
        body?.id ??
        body?.data?.id ??
        body?.data?.carId ??
        body?.data?.car?.id ??
        body?.carId ??
        body?.car?.id;
      if (carId) cy.wrap(carId).as("createdCarId");
    });

    cy.contains(".toast,.alert,[role='status']", /added|success/i, {
      timeout: 15000,
    }).should("be.visible");

    cy.contains(
      ".car,.card,article,tr",
      new RegExp(`${brand}\\s+${model}`, "i")
    ).should("exist");
  }

  openAddFuelExpenseFor(carTitle) {
    cy.contains(".car,.card,article,tr", new RegExp(carTitle, "i"))
      .should("be.visible")
      .within(() => {
        cy.contains("button,a", /add fuel expense/i).click({ force: true });
      });

    cy.get("ngb-modal-window.d-block.modal.show,[role='dialog']", {
      timeout: 15000,
    })
      .as("expenseDlg")
      .should("be.visible");

    cy.get("@expenseDlg")
      .find(".modal-title, h4, h5")
      .invoke("text")
      .then((t) => t.trim())
      .should((t) => {
        expect(/add (an )?expense|add fuel expense/i.test(t)).to.eq(true);
      });
  }
}
