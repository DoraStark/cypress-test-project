export default class GaragePage {
  open() {
    cy.contains("a,button", /^garage$/i).click({ force: true });
    cy.location("pathname").should("include", "/panel/garage");
  }

  addCar({ brand, model, mileage }) {
    cy.intercept("POST", "**/api/cars").as("createCar");

    cy.contains("button,a", /^add car$/i).click();
    cy.get(".modal.show,[role='dialog']").as("dlg");

    cy.intercept("GET", "**/api/cars/models*").as("models");

    cy.get("@dlg")
      .contains("label", /brand/i)
      .parent()
      .find("select")
      .select(brand, { force: true });

    cy.wait("@models");

    cy.get("@dlg")
      .contains("label", /model/i)
      .parent()
      .find("select")
      .select(model, { force: true });

    cy.get("@dlg")
      .contains("label", /mileage|odometer/i)
      .parent()
      .find("input")
      .clear()
      .type(String(mileage));

    cy.get("@dlg").contains("button,input[type='submit']", /^add$/i).click();

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

      expect(carId, "created car id").to.be.a("number");

      cy.wrap(carId).as("createdCarId");
      cy.writeFile("cypress/fixtures/lastCar.json", { carId });

      Cypress.env("createdCarId", carId);
    });

    cy.contains(".toast,.alert,[role='status']", /added|success/i).should(
      "be.visible"
    );

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
        expect(
          /add (an )?expense/i.test(t) || /add fuel expense/i.test(t)
        ).to.eq(true);
      });
  }
}
