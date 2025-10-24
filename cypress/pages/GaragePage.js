// POM: Garage
export default class GaragePage {
  open() {
    cy.contains("a,button", /^garage$/i).click({ force: true });
    cy.location("pathname").should("include", "/panel/garage");
  }

  addCar({ brand, model, mileage }) {
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

    cy.contains(".toast,.alert,[role='status']", /added|success/i).should(
      "be.visible"
    );
    cy.contains(
      ".car,.card,article,tr",
      new RegExp(`${brand}\\s+${model}`, "i")
    ).should("exist");
  }

  // открывает модалку "Add fuel expense" именно у нужной карточки
  openAddFuelExpenseFor(carTitle) {
    // клик по зелёной кнопке на нужной карточке
    cy.contains(".car,.card,article,tr", new RegExp(carTitle, "i"))
      .should("be.visible")
      .within(() => {
        cy.contains("button,a", /add fuel expense/i).click({ force: true });
      });

    // устойчиво ждём модалку и её заголовок
    cy.get("ngb-modal-window.d-block.modal.show,[role='dialog']", {
      timeout: 15000,
    })
      .as("expenseDlg")
      .should("be.visible");

    // заголовок может быть "Add an expense" или "Add fuel expense"
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
