/// <reference types="cypress" />
import GaragePage from "../../pages/GaragePage";
import ExpansesPage from "../../pages/ExpansesPage";

const garage = new GaragePage();
const expenses = new ExpansesPage();

describe("Register Garage + Fuel Expenses (UI, POM)", () => {
  before(() => {
    cy.registerNewUniqueUser({
      name: "John",
      lastName: "Doe",
      password: "Qauto123!",
    });

    garage.open();
    garage.addCar({ brand: "Audi", model: "TT", mileage: 12500 });
  });

  it("Добавление расхода топлива к созданной машине", () => {
    garage.openAddFuelExpenseFor("Audi TT");

    expenses.addExpense({ mileage: 12600, liters: 40, totalCost: 70 });

    expenses.shouldSeeExpense({ mileage: 12600 });
  });
});
