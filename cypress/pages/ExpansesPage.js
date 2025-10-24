// cypress/pages/ExpansesPage.js


const pad = (n) => String(n).padStart(2, "0");
const formatDDMMYYYY = (d) =>
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
const getYesterdayLocal = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDDMMYYYY(d);
};


export default class ExpansesPage {
  open() {
    cy.contains("a,button", /^fuel expenses$/i).click({ force: true });
    cy.location("pathname").should("include", "/panel/expenses");
  }

  
  addExpense({ mileage, liters, totalCost, date }) {
    cy.intercept("POST", "**/api/expenses").as("createExpense");

    cy.get("ngb-modal-window.d-block.modal.show,[role='dialog']")
      .as("dlg")
      .should("be.visible");

    
    const safeDate = date || getYesterdayLocal();
    cy.get("@dlg")
      .contains("label", /report date/i)
      .parent()
      .find("input")
      .clear()
      .type(safeDate);

    if (mileage != null) {
      cy.get("@dlg")
        .contains("label", /mileage|odometer/i)
        .parent()
        .find("input")
        .clear()
        .type(String(mileage));
    }

    cy.get("@dlg")
      .contains("label", /number of liters|liters|volume/i)
      .parent()
      .find("input")
      .clear()
      .type(String(liters));

    cy.get("@dlg")
      .contains("label", /total cost|price/i)
      .parent()
      .find("input")
      .clear()
      .type(String(totalCost));

    cy.get("@dlg").contains("button,input[type='submit']", /^add$/i).click();

    cy.wait("@createExpense")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);
    cy.contains(".toast,.alert,[role='status']", /added|success/i, {
      timeout: 15000,
    }).should("be.visible");
  }

  
  shouldSeeExpense({ carTitle, mileage }) {
    cy.contains(
      ".table,.list,.card,article,tr",
      new RegExp(String(mileage))
    ).should("exist");
    if (carTitle) {
      cy.contains(
        ".table,.list,.card,article,tr",
        new RegExp(carTitle, "i")
      ).should("exist");
    }
  }
}
