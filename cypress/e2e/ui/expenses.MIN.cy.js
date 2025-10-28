/// <reference types="cypress" />
import GaragePage from "../../pages/GaragePage";
import ExpansesPage from "../../pages/ExpansesPage";

const garage = new GaragePage();
const expenses = new ExpansesPage();

describe("Cars + Expenses: UI + API", () => {
  const CAR = { brand: "Audi", model: "TT", mileage: 12500 };
  const EXP1 = { mileage: 12600, liters: 40, totalCost: 70 };
  const EXP2 = { liters: 40, totalCost: 70 };

  it("UI add expense then API add expense and verify UI", () => {
    const email = `qa_${Date.now()}_${Math.floor(
      Math.random() * 1e6
    )}@example.com`;
    const password = "Qauto123!";
    const u = Cypress.env("basicAuthUser") || "guest";
    const p = Cypress.env("basicAuthPass") || "welcome2qauto";
    const base = (
      Cypress.config("baseUrl") || "https://qauto.forstudy.space"
    ).replace(/\/$/, "");
    const withAuth = new URL(base);
    withAuth.username = u;
    withAuth.password = p;

    cy.visit(withAuth.toString());
    cy.contains(/sign up|register/i).click({ force: true });

    cy.get("body")
      .then(($b) => {
        if ($b.find('[role="dialog"], .modal.show').length)
          return cy.get('[role="dialog"], .modal.show');
        return cy.wrap($b);
      })
      .as("dlg");

    cy.get("@dlg")
      .contains(/name/i)
      .parent()
      .find("input")
      .clear()
      .type("John");
    cy.get("@dlg")
      .contains(/last\s*name|surname/i)
      .parent()
      .find("input")
      .clear()
      .type("Doe");
    cy.get("@dlg")
      .contains(/^email$/i)
      .parent()
      .find("input")
      .clear()
      .type(email);
    cy.get("@dlg")
      .contains(/^password$/i)
      .parent()
      .find("input")
      .clear()
      .type(password);
    cy.get("@dlg")
      .contains(/(re-?enter|confirm)\s*password/i)
      .parent()
      .find("input")
      .clear()
      .type(password);
    cy.get("@dlg")
      .contains(/register|sign up/i)
      .click({ force: true });
    cy.location("pathname", { timeout: 20000 }).should("include", "/panel");

    garage.open();
    garage.addCar(CAR);

    cy.get("@createdCarId").then((carId) => {
      expect(carId).to.be.a("number");

      cy.request("GET", "/api/cars").then((r) => {
        expect(r.status).to.eq(200);
        const list = r.body?.data ?? r.body ?? [];
        const found = list.find((c) => {
          const idFromList = c?.id ?? c?.carId ?? c?.car?.id;
          const brand = (c?.brand || c?.make || "").toString().toLowerCase();
          const model = (c?.model || "").toString().toLowerCase();
          return (
            Number(idFromList) === Number(carId) &&
            brand.includes(CAR.brand.toLowerCase()) &&
            model.includes(CAR.model.toLowerCase())
          );
        });
        expect(found).to.exist;
      });

      cy.contains(".car,.card,article,tr", /Audi\s+TT/i).within(() => {
        cy.contains("button,a", /add fuel expense/i).click({ force: true });
      });
      expenses.addExpense(EXP1);
      expenses.open();
      expenses.shouldSeeExpense({ mileage: EXP1.mileage });

      cy.createExpenseApi({
        carId,
        liters: EXP2.liters,
        totalCost: EXP2.totalCost,
      }).then(({ mileage }) => {
        expenses.open();
        cy.contains(
          ".table,.list,.card,article,tr",
          new RegExp(`\\b${mileage}\\b`)
        ).should("exist");
      });
    });
  });
});
